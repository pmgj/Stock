async function logMovies(type, ticker) {
    const url = new URL("http://localhost:8080/Stock/webresources/stock");
    url.searchParams.append("ticker", ticker);
    url.searchParams.append("type", type);
    console.log(url.href);

    const response = await fetch(url.href);
    const html = await response.text();
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');
    console.log(html);
}
logMovies("acoes", "sanb11");