package controller;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("stock")
public class MyResource {

    @GET
    @Produces(MediaType.TEXT_HTML)
    public String listEmployees(@QueryParam("ticker") String ticker, @QueryParam("type") String type) throws IOException, InterruptedException {
        String url = String.format("https://investidor10.com.br/%s/%s", type, ticker);
        // String url = String.format("https://statusinvest.com.br/%s/%s", type, ticker);
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}
