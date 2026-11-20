# syntax=docker/dockerfile:1

FROM maven:3-eclipse-temurin-27 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -DskipTests package

FROM eclipse-temurin:27-jre AS runtime
RUN groupadd --system app && useradd --system --gid app app
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
ENV DB_URL=jdbc:sqlite:/data/chinook.db
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
