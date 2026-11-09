from django.conf import settings
from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import RegisterSerializer, UserCategoriesSerializer

REFRESH_COOKIE = 'refresh_token'
COOKIE_PATH = '/api/auth/'


def is_web(request):
    return request.headers.get('X-Client-Type') == 'web'


def set_refresh_cookie(response, token):
    response.set_cookie(
        REFRESH_COOKIE,
        token,
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Strict',
        path=COOKIE_PATH,
    )


class RegisterView(CreateAPIView):
    authentication_classes = []
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if is_web(request) and response.status_code == status.HTTP_200_OK:
            set_refresh_cookie(response, response.data.pop('refresh'))
        return response


class RefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        if not is_web(request):
            return super().post(request, *args, **kwargs)

        refresh = request.COOKIES.get(REFRESH_COOKIE)
        if not refresh:
            return Response({'detail': 'No refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={'refresh': refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as error:
            raise InvalidToken(error.args[0])

        response = Response({'access': serializer.validated_data['access']})
        if 'refresh' in serializer.validated_data:
            set_refresh_cookie(response, serializer.validated_data['refresh'])
        return response


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        refresh = request.COOKIES.get(REFRESH_COOKIE) if is_web(request) else request.data.get('refresh')
        response = Response(status=status.HTTP_205_RESET_CONTENT)

        if not refresh:
            response = Response({'detail': 'No refresh token.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                RefreshToken(refresh).blacklist()
            except TokenError:
                response = Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

        if is_web(request):
            response.delete_cookie(REFRESH_COOKIE, path=COOKIE_PATH)
        return response


class MyCategoriesView(RetrieveUpdateAPIView):
    serializer_class = UserCategoriesSerializer

    def get_object(self):
        return self.request.user