from fastapi import APIRouter, Depends, HTTPException, Request, status

from moldo_api.auth import SESSION_USER_ID_KEY, authenticate_user, require_current_user
from moldo_api.schemas.auth import AuthSession, AuthenticatedUser, LoginRequest

router = APIRouter()


@router.post("/login", response_model=AuthSession)
def login(request: Request, payload: LoginRequest) -> AuthSession:
    user = authenticate_user(payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    request.session.clear()
    request.session[SESSION_USER_ID_KEY] = user.id
    return AuthSession(user=user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request) -> None:
    request.session.clear()


@router.get("/me", response_model=AuthSession)
def get_me(user: AuthenticatedUser = Depends(require_current_user)) -> AuthSession:
    return AuthSession(user=user)
