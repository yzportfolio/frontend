package commercial.controllers

import com.gu.contentapi.client.model.v1.{Content, ItemResponse, Tag, TagsResponse}
import com.gu.contentapi.client.model.{ItemQuery, TagsQuery}
import common.ExecutionContexts.executionContext
import contentapi.ContentApiClient
import play.api.libs.json._
import play.api.mvc.{Action, Controller}

import scala.annotation.tailrec
import scala.concurrent.duration._
import scala.concurrent.{Await, Future}

class Auditor(capi: ContentApiClient) extends Controller {

  private val batchSize = 100
  private val maxWait   = 10.seconds

  private case class SectionAudit(tags: Seq[Tag]) {

    val sponsoredTags = tags.filter(_.activeSponsorships.nonEmpty)

    val asJson: JsValue = Json.obj(
      "tagCount" -> tags.size,
      //        "contentCount"  -> items.size,
      "sponsoredTags" -> sponsoredTagsToJson(sponsoredTags),
      "tags"          -> tagsToJson(tags)
      //        "content"       -> itemsToJson(items)
    )

    val asCsv: String =
      tagsToCsv("sponsored tag", sponsoredTags) ++
        tagsToCsv("tag", tags)

    def toCsv(fieldName: String, ids: Seq[String]): String =
      ids.mkString(
        start = s""""$fieldName","""",
        sep = s""""\n"$fieldName","""",
        end = s""""\n"""
      )
    def tagsToCsv(fieldName: String, tags: Seq[Tag]): String = toCsv(fieldName, tags.map(_.id).sorted)
    def itemsToCsv(items: Seq[Content]): String              = toCsv("content", items.map(_.id).sorted)

    def sponsoredTagsToJson(tags: Seq[Tag]): JsValue =
      JsArray(tags.sortBy(_.id).map { tag =>
        Json.obj(
          "id"      -> tag.id,
          "sponsor" -> tag.activeSponsorships.map(_.headOption map (_.sponsorName))
        )
      })
    def tagsToJson(tags: Seq[Tag]): JsValue       = JsArray(tags.map(_.id).sorted.map(JsString(_)))
    def itemsToJson(items: Seq[Content]): JsValue = JsArray(items.map(_.id).sorted.map(JsString(_)))
  }

  private def lookUpTags(sectionId: String): Seq[Tag] = {

    val q = capi.tags.section(sectionId)

    def lookUp(q: TagsQuery, pageIndex: Int): Future[TagsResponse] =
      capi.getResponse(q.pageSize(batchSize).page(pageIndex))

    @tailrec
    def go(acc: Seq[Tag], pageIndex: Int): Seq[Tag] = {
      val response   = Await.result(lookUp(q, pageIndex), maxWait)
      val pageCount  = response.pages
      val itemsSoFar = acc ++ response.results
      if (pageCount > pageIndex)
        go(itemsSoFar, pageIndex + 1)
      else itemsSoFar
    }

    go(Nil, 1)
  }

  private def lookUpContent(sectionId: String): Seq[Content] = {

    val q = capi.item(sectionId)

    def lookUp(q: ItemQuery, pageIndex: Int): Future[ItemResponse] =
      capi.getResponse(q.pageSize(batchSize).page(pageIndex))

    @tailrec
    def go(acc: Seq[Content], pageIndex: Int): Seq[Content] = {
      val response   = Await.result(lookUp(q, pageIndex), maxWait)
      val pageCount  = response.pages getOrElse 1
      val itemsSoFar = acc ++ response.results.getOrElse(Nil)
      if (pageCount > pageIndex)
        go(itemsSoFar, pageIndex + 1)
      else itemsSoFar
    }

    go(Nil, 1)
  }

  def auditAsJson(sectionId: String) = Action {
    Ok(SectionAudit(lookUpTags(sectionId)).asJson)
  }

  def auditAsCsv(sectionId: String) = Action {
    Ok(SectionAudit(lookUpTags(sectionId)).asCsv)
  }
}
