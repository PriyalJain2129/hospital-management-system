package com.hospital.controller;

import com.hospital.util.ApiService;
import com.hospital.util.SceneManager;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.stage.Stage;

public class LoginController {

    @FXML private TextField usernameField;
    @FXML private PasswordField passwordField;
    @FXML private Label errorLabel;
    @FXML private Button loginButton;

    @FXML
    public void initialize() {
        usernameField.textProperty().addListener((obs, o, n) -> errorLabel.setText(""));
        passwordField.textProperty().addListener((obs, o, n) -> errorLabel.setText(""));
    }

    @FXML
    public void handleLogin() {
        String username = usernameField.getText().trim();
        String password = passwordField.getText().trim();

        if (username.isEmpty() || password.isEmpty()) {
            errorLabel.setText("Please enter both username and password.");
            return;
        }

        try {
            String json = "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}";
            String response = ApiService.post("/auth/login", json);

            if (response.contains("\"success\":true")) {
                // Extract and store JWT token
                String token = response.replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");
                ApiService.setToken(token);
                System.out.println("JWT token saved: " + token.substring(0, 20) + "...");

                Stage stage = (Stage) loginButton.getScene().getWindow();
                stage.setWidth(1200);
                stage.setHeight(750);
                SceneManager.switchTo(stage, "dashboard");
            } else {
                errorLabel.setText("Invalid username or password.");
                passwordField.clear();
            }
        } catch (Exception e) {
            errorLabel.setText("Cannot connect to server. Is backend running?");
            e.printStackTrace();
        }
    }
}
