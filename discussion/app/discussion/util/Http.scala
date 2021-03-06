package discussion.util

import common.LoggingField.LogField
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.libs.json.{JsValue, Json}
import common.{ExecutionContexts, Logging, StopWatch}
import discussion.api.{NotFoundException, OtherException}

import scala.concurrent.Future
import scala.concurrent.duration._

trait Http extends Logging with ExecutionContexts {

  val wsClient: WSClient

  protected def getJsonOrError(url: String, onError: (WSResponse) => String, headers: (String, String)*): Future[JsValue] = {
    val stopWatch = new StopWatch
    GET(url, headers: _*) map { response =>
        response.status match {
          case 200 =>
            val dapiLatency = stopWatch.elapsed
            val customFields: List[LogField] = List("dapi.response.latency.millis" -> dapiLatency.toInt)
            logInfoWithCustomFields(s"DAPI responded successfully in ${dapiLatency} ms for url: ${url}", customFields)
            Json.parse(response.body)
          case otherStatus =>
            val errorMessage = onError(response)
            log.error(errorMessage)
            throw if(otherStatus == 404) NotFoundException(errorMessage) else OtherException(errorMessage)
        }
    }
  }

  protected def GET(url: String, headers: (String, String)*): Future[WSResponse] = {
    wsClient.url(url).withHeaders(headers: _*).withRequestTimeout(2.seconds).get()
  }

}
