package http

import akka.stream.Materializer
import com.gu.googleauth.{FilterExemption, UserIdentity}
import googleAuth.AuthCookie
import model.ApplicationContext
import play.api.{Environment, Mode}
import play.api.mvc.Results.Redirect
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.Future

object GoogleAuthFilters {
  val LOGIN_ORIGIN_KEY = "loginOriginUrl"

  class AuthFilterWithExemptions(loginUrl: FilterExemption, exemptions: Seq[FilterExemption])
                                (implicit val mat: Materializer, context: ApplicationContext, env: Environment) extends Filter {

    val authCookie = new AuthCookie
    private def doNotAuthenticate(request: RequestHeader) = context.environment.mode == Mode.Test ||
      request.path.startsWith(loginUrl.path) ||
      exemptions.exists(exemption => request.path.startsWith(exemption.path))

    def apply(nextFilter: (RequestHeader) => Future[Result]) (request: RequestHeader): Future[Result] = {
      if (doNotAuthenticate(request)) {
        nextFilter(request)
      } else {
        authCookie.toUserIdentity(request).filter(_.isValid).orElse(UserIdentity.fromRequest(request)) match {
          case Some(identity) if identity.isValid => nextFilter(request)
          case _ =>
            Future.successful(Redirect(loginUrl.path)
              .addingToSession((LOGIN_ORIGIN_KEY, request.uri))(request))
        }
      }
    }
  }
}
