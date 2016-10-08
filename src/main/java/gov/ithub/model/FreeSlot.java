package gov.ithub.model;

import java.util.Date;

/**
 * Created by claudiubar on 10/8/2016.
 */
public class FreeSlot {
    private Date start;
    private Date end;
    private Service service;

    public Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public Date getEnd() {
        return end;
    }

    public void setEnd(Date end) {
        this.end = end;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }
}
