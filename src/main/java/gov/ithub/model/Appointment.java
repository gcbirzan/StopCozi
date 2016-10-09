package gov.ithub.model;

import javax.persistence.*;
import java.util.Date;

/**
 * Created by claudiubar on 10/8/2016.
 */
@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    private Date start;
    private Date end;
    private String name;
    private String phone;
    @ManyToOne
    @JoinColumn(name = "officeId")
    private Office office;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Office getOffice() {
        return office;
    }

    public void setOffice(Office office) {
        this.office = office;
    }
    
    public void setEnd(Date end) {
    	this.end = end;
    }
    
    public Date getEnd() {
    	return this.end;
    }
}
