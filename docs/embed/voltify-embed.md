# Voltify — Embed-Snippet (White-Label iframe)

Der Solar-Konfigurator wird per `<iframe>` in die bestehende Webseite des Installateurs
eingebettet. Der `?i=<slug>`-Parameter sorgt dafür, dass alle dort erzeugten Leads
automatisch im CRM-Account des Installateurs landen.

Das mitgelieferte `<script>` empfängt `voltify:resize`-Nachrichten aus dem iframe und
passt die Höhe dynamisch an — so entstehen **keine** doppelten Scrollbalken.

> **Host austauschen bei eigener Domäne:** Sobald eine Produkt-Domäne existiert
> (z. B. `app.voltify.de`), nur die beiden mit `★` markierten Host-Strings ersetzen.
> Sonst ändert sich nichts.

---

## Konkret für sunwinwin (Ali Galioglu)

```html
<!-- Voltify Solar-Konfigurator -->
<iframe
  id="voltify-konfigurator"
  src="https://voltify-app.vercel.app/konfigurator?i=sunwinwin"  <!-- ★ Host -->
  title="Solar-Konfigurator"
  loading="lazy"
  style="width:100%;border:0;display:block;min-height:900px"
></iframe>
<script>
  (function () {
    var ALLOWED = "https://voltify-app.vercel.app"; // ★ Host
    window.addEventListener("message", function (e) {
      if (e.origin !== ALLOWED) return;
      if (!e.data || e.data.type !== "voltify:resize") return;
      var f = document.getElementById("voltify-konfigurator");
      if (f) f.style.height = e.data.height + "px";
    });
  })();
</script>
```

---

## Generische Vorlage (für weitere Kunden)

`SLUG` durch den jeweiligen `installer_slug` aus dem CRM-Profil ersetzen:

```html
<iframe
  id="voltify-konfigurator"
  src="https://voltify-app.vercel.app/konfigurator?i=SLUG"
  title="Solar-Konfigurator"
  loading="lazy"
  style="width:100%;border:0;display:block;min-height:900px"
></iframe>
<script>
  (function () {
    var ALLOWED = "https://voltify-app.vercel.app";
    window.addEventListener("message", function (e) {
      if (e.origin !== ALLOWED) return;
      if (!e.data || e.data.type !== "voltify:resize") return;
      var f = document.getElementById("voltify-konfigurator");
      if (f) f.style.height = e.data.height + "px";
    });
  })();
</script>
```

---

## Hinweise

- **WordPress:** Snippet in einen „Custom HTML"-Block einfügen (nicht in den visuellen
  Editor — der filtert `<script>` evtl. heraus). Alternativ ein HTML-Widget/Plugin.
- **Mobile:** Höhe wird automatisch angepasst; das `min-height:900px` ist nur der
  Startwert vor dem ersten `resize`-Event.
- **Branding:** Logo + Farben kommen automatisch aus dem `branding`-Feld des Profils
  (Einstellungen → White-Label). Ohne gepflegtes Branding erscheint der Standard-Look
  + „Powered by Voltify".
- **Demo vs. Live:** `?i=<slug>` erzeugt echte, zugeordnete Leads. Für eine reine
  Vorschau ohne Lead-Erzeugung zusätzlich `&demo=1` anhängen.
</content>
