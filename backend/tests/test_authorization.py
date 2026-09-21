from app.models import UserRole

def allowed(role, required): return role in required

def test_role_scoping():
    assert allowed(UserRole.ADMIN,{UserRole.ADMIN})
    assert not allowed(UserRole.CUSTOMER,{UserRole.ADMIN})
    assert allowed(UserRole.DELIVERY_PARTNER,{UserRole.DELIVERY_PARTNER})
