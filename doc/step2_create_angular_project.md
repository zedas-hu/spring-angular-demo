# Angular hozzáadása meglévő Spring projekthez

## 1

npx @angular/cli new frontend --standalone --routing --style=css

## 2

frontend/proxy.conf.json:
{
  "/api/**": {
    "target": "http://localhost:8080",
    "secure": false
  }
}