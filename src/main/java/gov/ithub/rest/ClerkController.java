package gov.ithub.rest;

import gov.ithub.dao.AppointmentDao;
import gov.ithub.dao.OfficeDao;
import gov.ithub.model.Appointment;
import gov.ithub.model.Office;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
* Created by claudiubar on 10/8/2016.
*/
@Component
@Path("/")
public class ClerkController {

    @Autowired
    private AppointmentDao appointmentDao;

    @Autowired
    private OfficeDao officeDao;

    @GET
    @Path("/appointments/{officeId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAppointments(@PathParam("officeId") Long officeId) throws ParseException {
      List<Appointment> appointmentList = appointmentDao.findAllByOffice(officeDao.findOne(officeId));
      return Response.status(200).entity(appointmentList).build();
    }

}
