```ps1
Invoke-WebRequest -Uri 'https://start.spring.io/starter.zip?type=maven-project&language=java&baseDir=backend&groupId=hu.zedas&artifactId=backend&name=backend&packageName=hu.zedas.backend&javaVersion=21&dependencies=web' -OutFile backend.zip
Expand-Archive -Path backend.zip -DestinationPath . -Force
Remove-Item backend.zip
cd backend
mvn spring-boot:run

```