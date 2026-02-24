 async function loadPage(page) {
      try {
        const res = await fetch(`pages/${page}.html`);
        if (!res.ok) throw new Error("Sayfa bulunamadı!");
        const html = await res.text();
        document.getElementById("content").innerHTML = html;
      } catch (err) {
        document.getElementById("content").innerHTML = `<p class="text-red-500">${err.message}</p>`;
      }
    }