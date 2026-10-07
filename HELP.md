# Getting Started

### Reference Documentation

For further reference, please consider the following sections:

* [Official Gradle documentation](https://docs.gradle.org)
* [Spring Boot Gradle Plugin Reference Guide](https://docs.spring.io/spring-boot/4.1.1/gradle-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/4.1.1/gradle-plugin/packaging-oci-image.html)
* [Spring Data JPA](https://docs.spring.io/spring-boot/4.1.1/reference/data/sql.html#data.sql.jpa-and-spring-data)
* [Spring Web](https://docs.spring.io/spring-boot/4.1.1/reference/web/servlet.html)

### Guides

The following guides illustrate how to use some features concretely:

* [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa/)
* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)

## Gemini

Set `GEMINI_API_KEY` in the local `.env` file, then call:

```http
POST /api/ai/chat
Content-Type: application/json

{"prompt":"냉장고 재료로 만들 수 있는 요리를 추천해줘"}
```

## Ingredient history and waste statistics

Consume an ingredient with `POST /api/fridge/items/{itemId}/consume`:

```json
{"quantity": 1}
```

Consumption and automatic expiry disposal are stored in `consumption_log`. Weekly disposal comparison is available at:

```http
GET /api/fridge/waste/weekly-comparison
```

The response groups quantities by unit so `GRAM`, `PIECE`, and `MILLILITER` are never incorrectly added together.

## Food CSV import

The importer is disabled by default. Enable it with environment variables:

```env
FOOD_DATA_IMPORT_ENABLED=true
FOOD_DATA_IMPORT_PATH=D:\path\to\food.csv
FOOD_DATA_IMPORT_CHARSET=CP949
```

The importer skips existing ingredient names, uses the food-name column when present, and reports created, skipped, and invalid rows. The source CSV is not copied into the repository.

### Additional Links

These additional references should also help you:

* [Gradle Build Scans – insights for your project's build](https://scans.gradle.com#gradle)
