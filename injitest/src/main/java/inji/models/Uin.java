package inji.models;

public class Uin {
    private String uin;
    private String phone;
    private String email;

    public Uin(String uin, String phone, String email) {
        this.uin = uin;
        this.phone = phone;
        this.email = email;
    }

    public String getUin() {
        return uin;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String toString() {
        return "UIN{" +
                "uin='" + uin + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}