from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.responses import HTMLResponse

from .config import get_settings
from .routers import auth_router, catalog, orders, customer, admin, delivery, bulk, schedule

settings = get_settings()

API_DESCRIPTION = """
## Field to Family (F2F) API

Production-oriented API for the **Fresh vegetables from farm to family** ordering platform.

### Core operating rules
- Delivery days: **Monday, Wednesday and Friday**
- Order cutoff: **05:00 Asia/Kolkata**
- Delivery window: **05:00–07:00 Asia/Kolkata**
- Payment: **Pay on Delivery**

Use the grouped endpoints below to test authentication, catalog, ordering, customer accounts,
admin operations, delivery operations, bulk inquiries and scheduling.
"""

app = FastAPI(
    title="Field to Family API",
    version="1.0.0",
    description=API_DESCRIPTION,
    docs_url=None,
    redoc_url=None,
    openapi_url="/openapi.json",
    swagger_ui_parameters={
        "displayRequestDuration": True,
        "filter": True,
        "persistAuthorization": True,
        "tryItOutEnabled": True,
        "docExpansion": "list",
        "defaultModelsExpandDepth": 1,
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(catalog.router)
app.include_router(orders.router)
app.include_router(customer.router)
app.include_router(admin.router)
app.include_router(delivery.router)
app.include_router(bulk.router)
app.include_router(schedule.router)


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "service": "f2f-api"}


@app.get("/", include_in_schema=False, response_class=HTMLResponse)
def api_portal():
    return HTMLResponse(
        """
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>F2F API | Field to Family</title>
  <style>
    :root{--green:#1f6b45;--green2:#2f8f5b;--ink:#17231c;--muted:#66736b;--line:#e4ebe6;--card:#fff;--bg:#f4f8f5}
    *{box-sizing:border-box} body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:radial-gradient(circle at top right,#dff2e5 0,transparent 34%),var(--bg)}
    .wrap{max-width:1100px;margin:0 auto;padding:48px 22px 70px}.brand{display:flex;align-items:center;gap:14px}.logo{width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,var(--green),var(--green2));color:#fff;display:grid;place-items:center;font-size:25px;box-shadow:0 10px 30px rgba(31,107,69,.18)}
    h1{margin:30px 0 10px;font-size:clamp(34px,5vw,54px);letter-spacing:-.04em}.lead{color:var(--muted);font-size:18px;max-width:760px;line-height:1.65}.status{display:inline-flex;gap:8px;align-items:center;margin-top:18px;padding:8px 12px;border-radius:999px;background:#e2f4e8;color:#17633e;font-weight:700;font-size:13px}.dot{width:8px;height:8px;border-radius:50%;background:#22a65a}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;margin-top:30px}.card{display:block;text-decoration:none;color:inherit;background:var(--card);border:1px solid var(--line);border-radius:22px;padding:24px;box-shadow:0 12px 35px rgba(33,55,42,.06);transition:.2s transform,.2s box-shadow}.card:hover{transform:translateY(-3px);box-shadow:0 18px 42px rgba(33,55,42,.1)}.icon{font-size:25px}.card h2{font-size:18px;margin:14px 0 7px}.card p{color:var(--muted);line-height:1.55;margin:0;font-size:14px}.meta{display:flex;flex-wrap:wrap;gap:9px;margin-top:30px}.pill{font-size:12px;padding:8px 11px;background:#edf3ef;border:1px solid var(--line);border-radius:999px;color:#405149}.footer{margin-top:48px;color:var(--muted);font-size:13px}
    @media (max-width:640px){.wrap{padding-top:28px}.grid{grid-template-columns:1fr}.brand span{font-weight:800}}
  </style>
</head>
<body>
  <main class="wrap">
    <div class="brand"><div class="logo">F2F</div><div><strong>Field to Family</strong><br><span style="color:#748178;font-size:13px">Fresh vegetables from farm to family</span></div></div>
    <div class="status"><span class="dot"></span> API online</div>
    <h1>F2F Operations API</h1>
    <p class="lead">A clean operational gateway for the customer ordering, procurement, delivery and cash-reconciliation workflow.</p>
    <section class="grid">
      <a class="card" href="/docs"><div class="icon">▣</div><h2>Interactive API Docs</h2><p>Test endpoints, authenticate, inspect request schemas and run live API calls.</p></a>
      <a class="card" href="/redoc"><div class="icon">◈</div><h2>Reference Docs</h2><p>Browse the API contract in a cleaner reference-oriented layout.</p></a>
      <a class="card" href="/openapi.json"><div class="icon">⌘</div><h2>OpenAPI JSON</h2><p>Machine-readable API specification for tooling, testing and integrations.</p></a>
      <a class="card" href="/health"><div class="icon">♥</div><h2>Health Check</h2><p>Verify that the F2F backend service is running.</p></a>
    </section>
    <div class="meta"><span class="pill">Monday · Wednesday · Friday</span><span class="pill">Cutoff · 05:00 IST</span><span class="pill">Delivery · 05:00–07:00 IST</span><span class="pill">Payment · Pay on Delivery</span></div>
    <div class="footer">Field to Family · Backend API v1.0.0</div>
  </main>
</body>
</html>
        """
    )


@app.get("/docs", include_in_schema=False)
def custom_swagger_ui():
    response = get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title="F2F API · Interactive Docs",
        swagger_ui_parameters=app.swagger_ui_parameters,
    )
    html = response.body.decode("utf-8")
    custom_css = """
    <style>
      :root { color-scheme: light; }
      html, body { background: #f4f8f5 !important; }
      body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif; }
      .swagger-ui { max-width: 1500px; margin: 0 auto; padding: 18px 22px 60px; }
      .swagger-ui .topbar { display: none; }
      .swagger-ui .information-container { background: #ffffff; border: 1px solid #e2ebe5; border-radius: 22px; padding: 20px 22px; margin-bottom: 18px; box-shadow: 0 12px 32px rgba(33,55,42,.06); }
      .swagger-ui .info .title { color: #1f6b45; font-size: 34px; letter-spacing: -.03em; }
      .swagger-ui .info p, .swagger-ui .info li { color: #627067; }
      .swagger-ui .opblock-tag { border: 1px solid #e1e9e3; border-radius: 14px; margin: 14px 0 8px; background: #fff; padding: 0 14px; box-shadow: 0 5px 18px rgba(33,55,42,.04); }
      .swagger-ui .opblock { border-radius: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(33,55,42,.04); }
      .swagger-ui .scheme-container { border-radius: 16px; box-shadow: none; border: 1px solid #e1e9e3; }
      .swagger-ui .btn.authorize { border-color: #1f6b45; color: #1f6b45; border-radius: 10px; }
      .swagger-ui .btn.execute { background: #1f6b45; border-color: #1f6b45; border-radius: 10px; }
      .swagger-ui input, .swagger-ui select, .swagger-ui textarea { border-radius: 9px; border-color: #d7e1da; }
      .swagger-ui .model-box { border-radius: 12px; }
      .swagger-ui table thead tr th, .swagger-ui table thead tr td { color: #1f6b45; }
    </style>
    """
    header = """
    <div style=\"background:linear-gradient(135deg,#1f6b45,#2f8f5b);color:white;padding:18px 24px;box-shadow:0 8px 25px rgba(31,107,69,.16);\">
      <div style=\"max-width:1500px;margin:0 auto;display:flex;align-items:center;gap:12px;font-family:Inter,system-ui,sans-serif;\">
        <div style=\"width:42px;height:42px;border-radius:13px;background:rgba(255,255,255,.16);display:grid;place-items:center;font-weight:900;\">F2F</div>
        <div><div style=\"font-weight:800;font-size:18px;\">Field to Family API</div><div style=\"opacity:.82;font-size:12px;\">Interactive backend documentation · v1.0.0</div></div>
      </div>
    </div>
    """
    html = html.replace("</head>", custom_css + "</head>")
    html = html.replace("<body>", "<body>" + header)
    return HTMLResponse(content=html, status_code=response.status_code)


@app.get("/redoc", include_in_schema=False)
def custom_redoc():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title="F2F API · Reference",
        redoc_favicon_url="https://cdn.jsdelivr.net/npm/@redocly/redoc@latest/favicon.png",
    )
