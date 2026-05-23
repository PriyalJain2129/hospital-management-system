package com.hospital;

import java.net.URL;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class Main extends Application {

    @Override
    public void start(Stage stage) throws Exception {

        URL fxmlUrl = getClass().getResource("/com/hospital/view/login.fxml");

        if (fxmlUrl == null) {
            throw new RuntimeException(
                "FXML not found! Check: src/main/resources/com/hospital/view/login.fxml"
            );
        }

        FXMLLoader loader = new FXMLLoader(fxmlUrl);
        Scene scene = new Scene(loader.load(), 900, 600);

        URL cssUrl = getClass().getResource("/com/hospital/css/styles.css");
        if (cssUrl != null) {
            scene.getStylesheets().add(cssUrl.toExternalForm());
        }

        stage.setTitle("Hospital Management System");
        stage.setScene(scene);
        stage.setResizable(true);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}