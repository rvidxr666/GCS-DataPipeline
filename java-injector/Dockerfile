FROM maven:3.8.6-jdk-8-slim AS build  
COPY src /home/app/src  
COPY pom.xml /home/app
RUN mvn -f /home/app/pom.xml clean package

FROM gcr.io/distroless/java  
COPY --from=build /home/app/target/big-data-proj-1.0-SNAPSHOT.jar /home/app/big-data-proj-1.0-SNAPSHOT.jar 
COPY google_credentials.json /home/.google/google_credentials.json
ENV GOOGLE_APPLICATION_CREDENTIALS="/home/.google/google_credentials.json"
EXPOSE 8080  
ENTRYPOINT ["java","-jar","/home/app/big-data-proj-1.0-SNAPSHOT.jar"]  
