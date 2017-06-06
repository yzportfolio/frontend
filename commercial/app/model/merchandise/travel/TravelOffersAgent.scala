package commercial.model.merchandise.travel

import commercial.model.Segment
import commercial.model.capi.{Keyword, Lookup}
import commercial.model.feeds.{FeedMetaData, ParsedFeed}
import common.ExecutionContexts
import contentapi.ContentApiClient
import commercial.model.merchandise.{MerchandiseAgent, TravelOffer}

import scala.concurrent.Future

class TravelOffersAgent(contentApiClient: ContentApiClient) extends MerchandiseAgent[TravelOffer] with ExecutionContexts {

  private val lookup = new Lookup(contentApiClient)

  def offersTargetedAt(segment: Segment): Seq[TravelOffer] = {
    val defaultOffers = available.sortBy(_.position).take(4)
    getTargetedMerchandise(segment, defaultOffers)(offer =>
      Keyword.idSuffixesIntersect(segment.context.keywords, offer.keywordIdSuffixes))
  }

  def specificTravelOffers(offerIdStrings: Seq[String]): Seq[TravelOffer] = {
    offerIdStrings flatMap (offerId => available find (_.id == offerId))
  }

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[TravelOffer]] = {

    def fetchKeywords(country: String): Future[Seq[String]] = for {
      keywords <- lookup.keyword("\"" + country + "\"", section = Some("travel"))
    } yield keywords.map(_.id).distinct

    def keywordsForCountry(country: String): Future[Seq[String]] = Future.sequence(fetchKeywords(country))

    def addKeywords(offers: Seq[TravelOffer]): Future[Seq[TravelOffer]] = {

      val populated = Future.sequence {
          
          val countries = offers.flatMap(_.countries).distinct
          val keywordsByCountry = countries.foldLeft(Map[String, Seq[String]()) { (m, country) => m + (country -> keywordsForCountry(country)) }
          
          offers.map { offer =>
            offer.copy(keywordIdSuffixes = offer.countries.flatMap(c => keywordsByCountry.get(c).getOrElse(Nil)) map Keyword.getIdSuffix)
          } 
      }

      populated.onSuccess { case offers =>
        val unpopulated = offers
          .withFilter(_.keywordIdSuffixes.isEmpty)
          .map { offer =>
            offer.title + ": countries(" + offer.countries.mkString + ")"
          }.mkString("; ")
        log.info(s"No keywords for these offers: $unpopulated")
      }

      populated
    }

    val parsedFeed: Future[ParsedFeed[TravelOffer]] = for {
      feed <- TravelOffersApi.parseOffers(feedMetaData, feedContent)
      withKeywords <- addKeywords(feed.contents)
    } yield feed.copy(contents = withKeywords)

    parsedFeed map { offers =>
      updateAvailableMerchandise(offers.contents)
    }

    parsedFeed
  }
}
