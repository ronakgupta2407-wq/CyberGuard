from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import AppState, ComplianceItem, Finding, Scan


def test_reset_dashboard_deletes_scans_and_related_data():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    with TestingSessionLocal() as db:
        scan = Scan(module_type="compliance", target="example.com")
        db.add(scan)
        db.flush()
        db.add(Finding(scan_id=scan.id, category="Privacy", severity="High", title="Test finding"))
        db.add(ComplianceItem(scan_id=scan.id, framework="GDPR", requirement_id="GDPR-01"))
        db.commit()

    def override_get_db():
        with TestingSessionLocal() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            response = test_client.delete("/api/scans")

        assert response.status_code == 200
        assert response.json() == {
            "status": "success",
            "deleted_count": 1,
            "deleted_findings": 1,
            "deleted_compliance_items": 1,
        }

        with TestingSessionLocal() as db:
            assert db.query(Scan).count() == 0
            assert db.query(Finding).count() == 0
            assert db.query(ComplianceItem).count() == 0
            assert db.query(AppState).filter_by(key="demo_data_seeded").first().value == "true"
    finally:
        app.dependency_overrides.pop(get_db, None)
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
