from pydantic import BaseModel, ConfigDict, Field


class AuthDto(BaseModel):
    model_config = ConfigDict(extra="forbid")


class LoginRequest(AuthDto):
    username: str = Field(min_length=3, max_length=40)
    password: str


class SignupRequest(AuthDto):
    username: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9_.-]+$")
    email: str = Field(min_length=5, max_length=254, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=80)


class AuthenticatedUser(AuthDto):
    id: str
    username: str
    email: str
    name: str


class AuthSession(AuthDto):
    user: AuthenticatedUser
