package com.hospital.util;

import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import java.net.URL;

public class SceneManager {

    public static void switchTo(Stage stage, String fxmlName) throws Exception {
        String path = "/com/hospital/view/" + fxmlName + ".fxml";
        URL url = SceneManager.class.getResource(path);

        if (url == null) {
            throw new RuntimeException("FXML not found: " + path);
        }

        FXMLLoader loader = new FXMLLoader(url);
        Scene scene = new Scene(loader.load());

        URL css = SceneManager.class.getResource("/com/hospital/css/styles.css");
        if (css != null) {
            scene.getStylesheets().add(css.toExternalForm());
        }

        stage.setScene(scene);
        stage.centerOnScreen();
    }
}