package gov.ithub.model;

import javax.persistence.*;

/**
 * Created by claudiubar on 10/8/2016.
 */
@Entity
@Table(name = "services")
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    private String name;
    @ManyToOne
    @JoinColumn(name = "agencyId")
    private Agency agency;
    private long duration;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public Agency getAgency() {
        return agency;
    }

    public void setAgency(Agency agency) {
        this.agency = agency;
    }
    
    public long getDuration() {
		return duration;
	}
    
    public void setDuration(long duration) {
		this.duration = duration;
	}
}
