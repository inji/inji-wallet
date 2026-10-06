package inji.models;

public class Vid {
    private String vid;
    private String phone;
    private String email;

    public Vid(String vid, String phone, String email) {
        this.vid = vid;
        this.phone = phone;
        this.email = email;
    }

    public String getVid() {
        return vid;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String toString() {
        return "VID{" +
                "vid='" + vid + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}