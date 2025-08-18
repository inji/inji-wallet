package inji.models;

public class Policy {
    private String policyNumber;
    private String name;
    private String dob; // Format: MM/dd/yyyy

    public Policy(String policyNumber, String name, String dob) {
        this.policyNumber = policyNumber;
        this.name = name;
        this.dob = dob;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public String getName() {
        return name;
    }

    public String getDob() {
        return dob;
    }

    @Override
    public String toString() {
        return "Policy{" +
                "policyNumber='" + policyNumber + '\'' +
                ", name='" + name + '\'' +
                ", dob='" + dob + '\'' +
                '}';
    }
}