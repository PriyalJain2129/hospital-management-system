package com.hospital.controller;

import com.hospital.model.*;
import com.hospital.util.ApiService;
import com.hospital.util.SceneManager;
import javafx.collections.*;
import javafx.fxml.FXML;
import javafx.geometry.*;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.*;
import javafx.stage.Stage;

public class DashboardController {

    @FXML private Label welcomeLabel;
    @FXML private Label pageTitle;
    @FXML private StackPane contentArea;
    @FXML private Button btnDashboard, btnPatients, btnDoctors, btnAppointments, btnBilling, btnLogout;

    // patient+doctor id lists for appointment form
    private ObservableList<Patient> patientCache = FXCollections.observableArrayList();
    private ObservableList<Doctor>  doctorCache  = FXCollections.observableArrayList();

    @FXML
    public void initialize() {
        welcomeLabel.setText("Welcome, Admin");
        showDashboardHome();
    }

    // -- DASHBOARD -------------------------------------------------------------
    @FXML public void showDashboardHome() {
        setActive(btnDashboard);
        pageTitle.setText("Dashboard Overview");
        contentArea.getChildren().setAll(buildPlaceholder("Dashboard Overview\nStats and charts coming soon."));
    }

    // -- PATIENTS --------------------------------------------------------------
    @FXML public void showPatients() {
        setActive(btnPatients);
        pageTitle.setText("Patient Management");
        try {
            patientCache = parsePatients(ApiService.get("/patients"));
            contentArea.getChildren().setAll(buildPatientScreen(patientCache));
        } catch (Exception e) {
            contentArea.getChildren().setAll(buildPlaceholder("Could not load patients."));
        }
    }

    private VBox buildPatientScreen(ObservableList<Patient> list) {
        TableView<Patient> table = new TableView<>(list);
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);
        table.getColumns().addAll(
            col("ID","id",50), col("First Name","firstName",120), col("Last Name","lastName",120),
            col("Gender","gender",80), col("DOB","dateOfBirth",110),
            col("Phone","phone",120), col("Email","email",190), col("Blood","bloodGroup",80)
        );
        Button add = styledBtn("+ Add","#6366f1","#4f46e5");
        Button edit = styledBtn("Edit","#0ea5e9","#0284c7");
        Button del = styledBtn("Delete","#64748b","#475569");
        Button ref = styledBtn("Refresh","#334155","#1e293b");
        add.setOnAction(e -> showPatientForm(null));
        edit.setOnAction(e -> { Patient s = table.getSelectionModel().getSelectedItem(); if (s!=null) showPatientForm(s); else showAlert("Select a patient.",Alert.AlertType.WARNING); });
        del.setOnAction(e -> { Patient s = table.getSelectionModel().getSelectedItem(); if (s==null){showAlert("Select a patient.",Alert.AlertType.WARNING);return;} if(confirmDialog("Delete "+s.getFullName()+"?")){try{ApiService.delete("/patients/"+s.getId());showPatients();}catch(Exception ex){showAlert(ex.getMessage(),Alert.AlertType.ERROR);}} });
        ref.setOnAction(e -> showPatients());
        VBox layout = new VBox(toolbar(add,edit,del,ref), table);
        VBox.setVgrow(table, Priority.ALWAYS);
        layout.setStyle("-fx-background-color:transparent;");
        return layout;
    }

    private void showPatientForm(Patient x) {
        boolean e = x!=null;
        TextField fn=inputField(e?x.getFirstName():"","First name");
        TextField ln=inputField(e?x.getLastName():"","Last name");
        TextField dob=inputField(e?x.getDateOfBirth():"","YYYY-MM-DD");
        TextField ph=inputField(e?x.getPhone():"","Phone");
        TextField em=inputField(e?x.getEmail():"","Email");
        TextField ad=inputField(e?x.getAddress():"","Address");
        TextField bl=inputField(e?x.getBloodGroup():"","A+, B+...");
        ComboBox<String> gen=styledCombo("Male","Female","Other");
        if(e) gen.setValue(x.getGender());
        Label err=errorLabel();
        GridPane g=formGrid();
        g.addRow(0,formLabel("First Name"),fn,formLabel("Last Name"),ln);
        g.addRow(1,formLabel("Gender"),gen,formLabel("Date of Birth"),dob);
        g.addRow(2,formLabel("Phone"),ph,formLabel("Email"),em);
        g.addRow(3,formLabel("Blood Group"),bl,formLabel("Address"),ad);
        g.add(err,0,4,4,1);
        Button save=styledBtn(e?"Update":"Save","#6366f1","#4f46e5");
        Button cancel=styledBtn("Cancel","#334155","#1e293b");
        save.setOnAction(ev -> {
            if(fn.getText().trim().isEmpty()||ln.getText().trim().isEmpty()){err.setText("Name required.");return;}
            String json="{\"firstName\":\""+fn.getText().trim()+"\",\"lastName\":\""+ln.getText().trim()+"\"," +
                "\"gender\":\""+gen.getValue()+"\",\"dateOfBirth\":\""+fixDate(dob.getText().trim())+"\"," +
                "\"phone\":\""+ph.getText().trim()+"\",\"email\":\""+em.getText().trim()+"\"," +
                "\"address\":\""+ad.getText().trim()+"\",\"bloodGroup\":\""+bl.getText().trim()+"\"}";
            try{ if(e) ApiService.put("/patients/"+x.getId(),json); else ApiService.post("/patients",json); showPatients(); }
            catch(Exception ex){err.setText("Error: "+ex.getMessage());}
        });
        cancel.setOnAction(ev->showPatients());
        contentArea.getChildren().setAll(buildForm(e?"Edit Patient":"Add Patient",g,save,cancel));
    }

    // -- DOCTORS ---------------------------------------------------------------
    @FXML public void showDoctors() {
        setActive(btnDoctors);
        pageTitle.setText("Doctor Management");
        try {
            doctorCache = parseDoctors(ApiService.get("/doctors"));
            contentArea.getChildren().setAll(buildDoctorScreen(doctorCache));
        } catch (Exception e) {
            contentArea.getChildren().setAll(buildPlaceholder("Could not load doctors."));
        }
    }

    private VBox buildDoctorScreen(ObservableList<Doctor> list) {
        TableView<Doctor> table = new TableView<>(list);
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);
        table.getColumns().addAll(
            docCol("ID","id",50), docCol("First Name","firstName",120), docCol("Last Name","lastName",120),
            docCol("Specialization","specialization",160), docCol("Phone","phone",120),
            docCol("Email","email",190), docCol("Available Days","availableDays",140)
        );
        Button add=styledBtn("+ Add","#6366f1","#4f46e5");
        Button edit=styledBtn("Edit","#0ea5e9","#0284c7");
        Button del=styledBtn("Delete","#64748b","#475569");
        Button ref=styledBtn("Refresh","#334155","#1e293b");
        add.setOnAction(e->showDoctorForm(null));
        edit.setOnAction(e->{Doctor s=table.getSelectionModel().getSelectedItem();if(s!=null)showDoctorForm(s);else showAlert("Select a doctor.",Alert.AlertType.WARNING);});
        del.setOnAction(e->{Doctor s=table.getSelectionModel().getSelectedItem();if(s==null){showAlert("Select a doctor.",Alert.AlertType.WARNING);return;}if(confirmDialog("Delete "+s.getFullName()+"?")){try{ApiService.delete("/doctors/"+s.getId());showDoctors();}catch(Exception ex){showAlert(ex.getMessage(),Alert.AlertType.ERROR);}}});
        ref.setOnAction(e->showDoctors());
        VBox layout=new VBox(toolbar(add,edit,del,ref),table);
        VBox.setVgrow(table,Priority.ALWAYS);
        layout.setStyle("-fx-background-color:transparent;");
        return layout;
    }

    private void showDoctorForm(Doctor x) {
        boolean e=x!=null;
        TextField fn=inputField(e?x.getFirstName():"","First name");
        TextField ln=inputField(e?x.getLastName():"","Last name");
        TextField sp=inputField(e?x.getSpecialization():"","e.g. Cardiologist");
        TextField ph=inputField(e?x.getPhone():"","Phone");
        TextField em=inputField(e?x.getEmail():"","Email");
        TextField dy=inputField(e?x.getAvailableDays():"","Mon,Wed,Fri");
        Label err=errorLabel();
        GridPane g=formGrid();
        g.addRow(0,formLabel("First Name"),fn,formLabel("Last Name"),ln);
        g.addRow(1,formLabel("Specialization"),sp,formLabel("Phone"),ph);
        g.addRow(2,formLabel("Email"),em,formLabel("Available Days"),dy);
        g.add(err,0,3,4,1);
        Button save=styledBtn(e?"Update":"Save","#6366f1","#4f46e5");
        Button cancel=styledBtn("Cancel","#334155","#1e293b");
        save.setOnAction(ev->{
            if(fn.getText().trim().isEmpty()||ln.getText().trim().isEmpty()){err.setText("Name required.");return;}
            String json="{\"firstName\":\""+fn.getText().trim()+"\",\"lastName\":\""+ln.getText().trim()+"\"," +
                "\"specialization\":\""+sp.getText().trim()+"\",\"phone\":\""+ph.getText().trim()+"\"," +
                "\"email\":\""+em.getText().trim()+"\",\"availableDays\":\""+dy.getText().trim()+"\"}";
            try{if(e) ApiService.put("/doctors/"+x.getId(),json); else ApiService.post("/doctors",json);showDoctors();}
            catch(Exception ex){err.setText("Error: "+ex.getMessage());}
        });
        cancel.setOnAction(ev->showDoctors());
        contentArea.getChildren().setAll(buildForm(e?"Edit Doctor":"Add Doctor",g,save,cancel));
    }

    // -- APPOINTMENTS ----------------------------------------------------------
    @FXML public void showAppointments() {
        setActive(btnAppointments);
        pageTitle.setText("Appointments");
        try {
            if(patientCache.isEmpty()) patientCache=parsePatients(ApiService.get("/patients"));
            if(doctorCache.isEmpty())  doctorCache=parseDoctors(ApiService.get("/doctors"));
            ObservableList<Appointment> list=parseAppointments(ApiService.get("/appointments"));
            contentArea.getChildren().setAll(buildAppointmentScreen(list));
        } catch(Exception e) {
            contentArea.getChildren().setAll(buildPlaceholder("Could not load appointments."));
        }
    }

    private VBox buildAppointmentScreen(ObservableList<Appointment> list) {
        TableView<Appointment> table=new TableView<>(list);
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);
        TableColumn<Appointment,Integer> cId=new TableColumn<>("ID"); cId.setCellValueFactory(new PropertyValueFactory<>("id")); cId.setPrefWidth(50);
        TableColumn<Appointment,String> cPat=new TableColumn<>("Patient"); cPat.setCellValueFactory(new PropertyValueFactory<>("patientName")); cPat.setPrefWidth(150);
        TableColumn<Appointment,String> cDoc=new TableColumn<>("Doctor"); cDoc.setCellValueFactory(new PropertyValueFactory<>("doctorName")); cDoc.setPrefWidth(150);
        TableColumn<Appointment,String> cDat=new TableColumn<>("Date"); cDat.setCellValueFactory(new PropertyValueFactory<>("appointmentDate")); cDat.setPrefWidth(110);
        TableColumn<Appointment,String> cTim=new TableColumn<>("Time"); cTim.setCellValueFactory(new PropertyValueFactory<>("appointmentTime")); cTim.setPrefWidth(90);
        TableColumn<Appointment,String> cSts=new TableColumn<>("Status"); cSts.setCellValueFactory(new PropertyValueFactory<>("status")); cSts.setPrefWidth(110);
        TableColumn<Appointment,String> cNot=new TableColumn<>("Notes"); cNot.setCellValueFactory(new PropertyValueFactory<>("notes")); cNot.setPrefWidth(200);
        table.getColumns().addAll(cId,cPat,cDoc,cDat,cTim,cSts,cNot);
        Button add=styledBtn("+ Book Appointment","#6366f1","#4f46e5");
        Button del=styledBtn("Delete","#64748b","#475569");
        Button ref=styledBtn("Refresh","#334155","#1e293b");
        add.setOnAction(e->showAppointmentForm());
        del.setOnAction(e->{Appointment s=table.getSelectionModel().getSelectedItem();if(s==null){showAlert("Select an appointment.",Alert.AlertType.WARNING);return;}if(confirmDialog("Delete this appointment?")){try{ApiService.delete("/appointments/"+s.getId());showAppointments();}catch(Exception ex){showAlert(ex.getMessage(),Alert.AlertType.ERROR);}}});
        ref.setOnAction(e->showAppointments());
        VBox layout=new VBox(toolbar(add,del,ref),table);
        VBox.setVgrow(table,Priority.ALWAYS);
        layout.setStyle("-fx-background-color:transparent;");
        return layout;
    }

    private void showAppointmentForm() {
        ComboBox<Patient> patBox=new ComboBox<>(patientCache);
        patBox.setPromptText("Select Patient");
        patBox.setPrefWidth(250);
        patBox.setStyle("-fx-background-color:#0f172a;-fx-text-fill:#f1f5f9;-fx-border-color:#334155;-fx-border-radius:6;-fx-font-size:13px;");
        patBox.setCellFactory(lv->new ListCell<>(){protected void updateItem(Patient p,boolean empty){super.updateItem(p,empty);setText(empty||p==null?null:p.getFullName());}});
        patBox.setButtonCell(new ListCell<>(){protected void updateItem(Patient p,boolean empty){super.updateItem(p,empty);setText(empty||p==null?null:p.getFullName());}});

        ComboBox<Doctor> docBox=new ComboBox<>(doctorCache);
        docBox.setPromptText("Select Doctor");
        docBox.setPrefWidth(250);
        docBox.setStyle("-fx-background-color:#0f172a;-fx-text-fill:#f1f5f9;-fx-border-color:#334155;-fx-border-radius:6;-fx-font-size:13px;");
        docBox.setCellFactory(lv->new ListCell<>(){protected void updateItem(Doctor d,boolean empty){super.updateItem(d,empty);setText(empty||d==null?null:d.getFullName());}});
        docBox.setButtonCell(new ListCell<>(){protected void updateItem(Doctor d,boolean empty){super.updateItem(d,empty);setText(empty||d==null?null:d.getFullName());}});

        TextField dateField=inputField("","YYYY-MM-DD");
        TextField timeField=inputField("","HH:MM e.g. 09:30");
        ComboBox<String> statusBox=styledCombo("SCHEDULED","COMPLETED","CANCELLED");
        TextField notesField=inputField("","Optional notes");
        Label err=errorLabel();

        GridPane g=formGrid();
        g.addRow(0,formLabel("Patient"),patBox,formLabel("Doctor"),docBox);
        g.addRow(1,formLabel("Date"),dateField,formLabel("Time"),timeField);
        g.addRow(2,formLabel("Status"),statusBox,formLabel("Notes"),notesField);
        g.add(err,0,3,4,1);

        Button save=styledBtn("Book Appointment","#6366f1","#4f46e5");
        Button cancel=styledBtn("Cancel","#334155","#1e293b");
        save.setOnAction(ev->{
            if(patBox.getValue()==null||docBox.getValue()==null){err.setText("Select patient and doctor.");return;}
            if(dateField.getText().trim().isEmpty()||timeField.getText().trim().isEmpty()){err.setText("Date and time required.");return;}
            String time=timeField.getText().trim();
            if(time.length()==5) time=time+":00";
            String json="{\"patientId\":\""+patBox.getValue().getId()+"\",\"doctorId\":\""+docBox.getValue().getId()+"\"," +
                "\"appointmentDate\":\""+fixDate(dateField.getText().trim())+"\",\"appointmentTime\":\""+time+"\"," +
                "\"status\":\""+statusBox.getValue()+"\",\"notes\":\""+notesField.getText().trim()+"\"}";
            try{ApiService.post("/appointments",json);showAppointments();}
            catch(Exception ex){err.setText("Error: "+ex.getMessage());}
        });
        cancel.setOnAction(ev->showAppointments());
        contentArea.getChildren().setAll(buildForm("Book Appointment",g,save,cancel));
    }

    // -- BILLING ---------------------------------------------------------------
    @FXML public void showBilling() {
        setActive(btnBilling);
        pageTitle.setText("Billing");
        try {
            if(patientCache.isEmpty()) patientCache=parsePatients(ApiService.get("/patients"));
            ObservableList<Billing> list=parseBilling(ApiService.get("/billing"));
            contentArea.getChildren().setAll(buildBillingScreen(list));
        } catch(Exception e) {
            contentArea.getChildren().setAll(buildPlaceholder("Could not load billing."));
        }
    }

    private VBox buildBillingScreen(ObservableList<Billing> list) {
        TableView<Billing> table=new TableView<>(list);
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);
        TableColumn<Billing,Integer> cId=new TableColumn<>("ID"); cId.setCellValueFactory(new PropertyValueFactory<>("id")); cId.setPrefWidth(50);
        TableColumn<Billing,String> cPat=new TableColumn<>("Patient"); cPat.setCellValueFactory(new PropertyValueFactory<>("patientName")); cPat.setPrefWidth(160);
        TableColumn<Billing,Double> cAmt=new TableColumn<>("Amount (Rs)"); cAmt.setCellValueFactory(new PropertyValueFactory<>("amount")); cAmt.setPrefWidth(120);
        TableColumn<Billing,String> cSts=new TableColumn<>("Status"); cSts.setCellValueFactory(new PropertyValueFactory<>("status")); cSts.setPrefWidth(110);
        TableColumn<Billing,String> cDat=new TableColumn<>("Payment Date"); cDat.setCellValueFactory(new PropertyValueFactory<>("paymentDate")); cDat.setPrefWidth(120);
        TableColumn<Billing,String> cDes=new TableColumn<>("Description"); cDes.setCellValueFactory(new PropertyValueFactory<>("description")); cDes.setPrefWidth(220);
        table.getColumns().addAll(cId,cPat,cAmt,cSts,cDat,cDes);
        Button add=styledBtn("+ Add Bill","#6366f1","#4f46e5");
        Button del=styledBtn("Delete","#64748b","#475569");
        Button ref=styledBtn("Refresh","#334155","#1e293b");
        add.setOnAction(e->showBillingForm());
        del.setOnAction(e->{Billing s=table.getSelectionModel().getSelectedItem();if(s==null){showAlert("Select a bill.",Alert.AlertType.WARNING);return;}if(confirmDialog("Delete this bill?")){try{ApiService.delete("/billing/"+s.getId());showBilling();}catch(Exception ex){showAlert(ex.getMessage(),Alert.AlertType.ERROR);}}});
        ref.setOnAction(e->showBilling());
        VBox layout=new VBox(toolbar(add,del,ref),table);
        VBox.setVgrow(table,Priority.ALWAYS);
        layout.setStyle("-fx-background-color:transparent;");
        return layout;
    }

    private void showBillingForm() {
        ComboBox<Patient> patBox=new ComboBox<>(patientCache);
        patBox.setPromptText("Select Patient");
        patBox.setPrefWidth(250);
        patBox.setStyle("-fx-background-color:#0f172a;-fx-text-fill:#f1f5f9;-fx-border-color:#334155;-fx-border-radius:6;-fx-font-size:13px;");
        patBox.setCellFactory(lv->new ListCell<>(){protected void updateItem(Patient p,boolean empty){super.updateItem(p,empty);setText(empty||p==null?null:p.getFullName());}});
        patBox.setButtonCell(new ListCell<>(){protected void updateItem(Patient p,boolean empty){super.updateItem(p,empty);setText(empty||p==null?null:p.getFullName());}});

        TextField amtField=inputField("","e.g. 500.00");
        ComboBox<String> statusBox=styledCombo("PENDING","PAID","CANCELLED");
        TextField dateField=inputField("","YYYY-MM-DD (optional)");
        TextField descField=inputField("","e.g. Consultation fee");
        Label err=errorLabel();

        GridPane g=formGrid();
        g.addRow(0,formLabel("Patient"),patBox,formLabel("Amount (Rs)"),amtField);
        g.addRow(1,formLabel("Status"),statusBox,formLabel("Payment Date"),dateField);
        g.addRow(2,formLabel("Description"),descField);
        g.add(err,0,3,4,1);

        Button save=styledBtn("Save Bill","#6366f1","#4f46e5");
        Button cancel=styledBtn("Cancel","#334155","#1e293b");
        save.setOnAction(ev->{
            if(patBox.getValue()==null){err.setText("Select a patient.");return;}
            if(amtField.getText().trim().isEmpty()){err.setText("Amount required.");return;}
            String json="{\"patientId\":\""+patBox.getValue().getId()+"\",\"amount\":\""+amtField.getText().trim()+"\"," +
                "\"status\":\""+statusBox.getValue()+"\",\"paymentDate\":\""+fixDate(dateField.getText().trim())+"\"," +
                "\"description\":\""+descField.getText().trim()+"\"}";
            try{ApiService.post("/billing",json);showBilling();}
            catch(Exception ex){err.setText("Error: "+ex.getMessage());}
        });
        cancel.setOnAction(ev->showBilling());
        contentArea.getChildren().setAll(buildForm("Add Bill",g,save,cancel));
    }

    // -- LOGOUT ----------------------------------------------------------------
    @FXML public void handleLogout() {
        try { Stage stage=(Stage)btnLogout.getScene().getWindow(); stage.setWidth(900); stage.setHeight(600); SceneManager.switchTo(stage,"login"); }
        catch(Exception e){e.printStackTrace();}
    }

    // -- HELPERS ---------------------------------------------------------------
    private <T> TableColumn<Patient,T> col(String t,String p,double w){TableColumn<Patient,T> c=new TableColumn<>(t);c.setCellValueFactory(new PropertyValueFactory<>(p));c.setPrefWidth(w);return c;}
    private <T> TableColumn<Doctor,T> docCol(String t,String p,double w){TableColumn<Doctor,T> c=new TableColumn<>(t);c.setCellValueFactory(new PropertyValueFactory<>(p));c.setPrefWidth(w);return c;}

    private Button styledBtn(String text,String bg,String hover){
        Button btn=new Button(text);
        String base="-fx-background-color:"+bg+";-fx-text-fill:#fff;-fx-background-radius:7;-fx-padding:9 18 9 18;-fx-cursor:hand;-fx-font-size:13px;-fx-font-weight:bold;";
        String hov="-fx-background-color:"+hover+";-fx-text-fill:#fff;-fx-background-radius:7;-fx-padding:9 18 9 18;-fx-cursor:hand;-fx-font-size:13px;-fx-font-weight:bold;";
        btn.setStyle(base);
        btn.setOnMouseEntered(e->btn.setStyle(hov));
        btn.setOnMouseExited(e->btn.setStyle(base));
        return btn;
    }

    private TextField inputField(String v,String p){TextField tf=new TextField(v);tf.setPromptText(p);tf.setPrefWidth(250);tf.setStyle("-fx-background-color:#0f172a;-fx-text-fill:#f1f5f9;-fx-prompt-text-fill:#475569;-fx-border-color:#334155;-fx-border-radius:6;-fx-background-radius:6;-fx-padding:9 12 9 12;-fx-font-size:13px;");return tf;}
    private ComboBox<String> styledCombo(String...items){ComboBox<String> cb=new ComboBox<>();cb.getItems().addAll(items);cb.setValue(items[0]);cb.setStyle("-fx-background-color:#0f172a;-fx-text-fill:#f1f5f9;-fx-border-color:#334155;-fx-border-radius:6;-fx-pref-width:250;-fx-font-size:13px;");return cb;}
    private Label formLabel(String t){Label l=new Label(t);l.setStyle("-fx-text-fill:#94a3b8;-fx-font-size:12px;-fx-font-weight:bold;");return l;}
    private Label errorLabel(){Label l=new Label("");l.setStyle("-fx-text-fill:#f87171;-fx-font-size:12px;");return l;}
    private GridPane formGrid(){GridPane g=new GridPane();g.setHgap(24);g.setVgap(16);g.setPadding(new Insets(24));return g;}
    private HBox toolbar(Button...btns){HBox b=new HBox(10,btns);b.setAlignment(Pos.CENTER_LEFT);b.setPadding(new Insets(0,0,14,0));return b;}
    private VBox buildPlaceholder(String t){Label l=new Label(t);l.setStyle("-fx-font-size:15px;-fx-text-fill:#475569;-fx-text-alignment:center;");l.setWrapText(true);VBox b=new VBox(l);b.setAlignment(Pos.CENTER);b.setStyle("-fx-background-color:#1e293b;-fx-background-radius:12;-fx-padding:60;");return b;}
    private void setActive(Button a){for(Button b:new Button[]{btnDashboard,btnPatients,btnDoctors,btnAppointments,btnBilling})b.getStyleClass().remove("active");a.getStyleClass().add("active");}
    private void showAlert(String m,Alert.AlertType t){Alert a=new Alert(t);a.setHeaderText(null);a.setContentText(m);a.showAndWait();}
    private boolean confirmDialog(String m){Alert a=new Alert(Alert.AlertType.CONFIRMATION);a.setHeaderText(null);a.setContentText(m);return a.showAndWait().filter(b->b==ButtonType.OK).isPresent();}
    private String fixDate(String d){if(d==null||d.isEmpty())return "";d=d.replace("/","-");if(d.matches("\\d{2}-\\d{2}-\\d{4}")){String[]p=d.split("-");d=p[2]+"-"+p[1]+"-"+p[0];}return d;}

    private VBox buildForm(String title,GridPane grid,Button save,Button cancel){
        Label t=new Label(title);t.setStyle("-fx-font-size:18px;-fx-font-weight:bold;-fx-text-fill:#f1f5f9;-fx-padding:24 24 0 24;");
        HBox btns=new HBox(12,save,cancel);btns.setAlignment(Pos.CENTER_RIGHT);btns.setPadding(new Insets(16,24,24,24));
        VBox form=new VBox(t,grid,btns);form.setStyle("-fx-background-color:#1e293b;-fx-background-radius:12;");form.setMaxWidth(860);
        VBox wrap=new VBox(form);wrap.setAlignment(Pos.TOP_CENTER);wrap.setPadding(new Insets(20));wrap.setStyle("-fx-background-color:#0f172a;");
        return wrap;
    }

    private ObservableList<Patient> parsePatients(String json){
        ObservableList<Patient> list=FXCollections.observableArrayList();
        json=json.trim().replaceAll("^\\[|\\]$","");if(json.isEmpty())return list;
        for(String obj:json.split("\\},\\{")){obj=obj.replaceAll("[\\[\\]\\{\\}]","");Patient p=new Patient();
            for(String pair:obj.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)")){String[]kv=pair.split(":",2);if(kv.length<2)continue;String key=kv[0].replaceAll("\"","").trim();String val=kv[1].replaceAll("\"","").trim();if(val.equals("null"))val="";
                switch(key){case"id"->p.setId(Integer.parseInt(val));case"firstName"->p.setFirstName(val);case"lastName"->p.setLastName(val);case"dateOfBirth"->p.setDateOfBirth(val);case"gender"->p.setGender(val);case"phone"->p.setPhone(val);case"email"->p.setEmail(val);case"address"->p.setAddress(val);case"bloodGroup"->p.setBloodGroup(val);}}
            list.add(p);}return list;}

    private ObservableList<Doctor> parseDoctors(String json){
        ObservableList<Doctor> list=FXCollections.observableArrayList();
        json=json.trim().replaceAll("^\\[|\\]$","");if(json.isEmpty())return list;
        for(String obj:json.split("\\},\\{")){obj=obj.replaceAll("[\\[\\]\\{\\}]","");Doctor d=new Doctor();
            for(String pair:obj.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)")){String[]kv=pair.split(":",2);if(kv.length<2)continue;String key=kv[0].replaceAll("\"","").trim();String val=kv[1].replaceAll("\"","").trim();if(val.equals("null"))val="";
                switch(key){case"id"->d.setId(Integer.parseInt(val));case"firstName"->d.setFirstName(val);case"lastName"->d.setLastName(val);case"specialization"->d.setSpecialization(val);case"phone"->d.setPhone(val);case"email"->d.setEmail(val);case"availableDays"->d.setAvailableDays(val);}}
            list.add(d);}return list;}

    private ObservableList<Appointment> parseAppointments(String json){
        ObservableList<Appointment> list=FXCollections.observableArrayList();
        json=json.trim().replaceAll("^\\[|\\]$","");if(json.isEmpty())return list;
        for(String obj:json.split("\\},\\{")){
            obj=obj.replaceAll("\\{\"patient\":\\{[^}]*\\}","").replaceAll("\\{\"doctor\":\\{[^}]*\\}","");
            Appointment a=new Appointment();
            if(obj.contains("\"patient\":{")){}
            try{
                if(obj.contains("\"id\":"))a.setId(Integer.parseInt(obj.replaceAll(".*\"id\":(\\d+).*","$1").replaceAll("[^0-9]","")));
                if(obj.contains("\"appointmentDate\":"))a.setAppointmentDate(obj.replaceAll(".*\"appointmentDate\":\"([^\"]+)\".*","$1"));
                if(obj.contains("\"appointmentTime\":"))a.setAppointmentTime(obj.replaceAll(".*\"appointmentTime\":\"([^\"]+)\".*","$1"));
                if(obj.contains("\"status\":"))a.setStatus(obj.replaceAll(".*\"status\":\"([^\"]+)\".*","$1"));
                if(obj.contains("\"notes\":"))a.setNotes(obj.replaceAll(".*\"notes\":\"([^\"]+)\".*","$1"));
            } catch(Exception ignored){}
            list.add(a);}return list;}

    private ObservableList<Billing> parseBilling(String json){
        ObservableList<Billing> list=FXCollections.observableArrayList();
        json=json.trim().replaceAll("^\\[|\\]$","");if(json.isEmpty())return list;
        for(String obj:json.split("\\},\\{")){obj=obj.replaceAll("[\\[\\]\\{\\}]","");Billing b=new Billing();
            for(String pair:obj.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)")){String[]kv=pair.split(":",2);if(kv.length<2)continue;String key=kv[0].replaceAll("\"","").trim();String val=kv[1].replaceAll("\"","").trim();if(val.equals("null"))val="";
                switch(key){case"id"->b.setId(Integer.parseInt(val.replaceAll("[^0-9]","")));case"amount"->b.setAmount(Double.parseDouble(val.replaceAll("[^0-9.]","")));case"status"->b.setStatus(val);case"paymentDate"->b.setPaymentDate(val);case"description"->b.setDescription(val);}}
            list.add(b);}return list;}
}
