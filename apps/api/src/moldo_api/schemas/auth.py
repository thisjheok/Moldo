from pydantic import BaseModel, ConfigDict


class AuthDto(BaseModel):
    model_config = ConfigDict(extra="forbid")


class LoginRequest(AuthDto):
    email: str
    password: str


class AuthenticatedUser(AuthDto):
    id: str
    email: str
    name: str


class AuthSession(AuthDto):
    user: AuthenticatedUser
