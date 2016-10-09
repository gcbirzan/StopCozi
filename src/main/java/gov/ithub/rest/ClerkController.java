package gov.ithub.rest;

import gov.ithub.dao.AppointmentDao;
import gov.ithub.dao.OfficeDao;
import gov.ithub.model.Appointment;
import gov.ithub.model.Office;
import gov.ithub.service.AppointmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.Optional;
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
    private AppointmentService appointmentService;

    @Autowired
    private OfficeDao officeDao;

    @GET
    @Path("/appointments/{officeId}/{date}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAppointments(
        @PathParam("officeId") Long officeId,
        @PathParam("date") String date) throws ParseException {
      Office office = officeDao.findOne(officeId);
      if (office == null) {
        return Response.status(404).build();
      }

      Date start = new SimpleDateFormat("yyyy-MM-dd").parse(date);
      Calendar cal = Calendar.getInstance();
      cal.setTime(start);
      cal.add(Calendar.HOUR, 24);
      Date end = cal.getTime();

      // TODO: use appointmentService instead of Dao.
      List<Appointment> appointmentList = appointmentDao.getAppointmentsForService(office.getService().getId(), start, end);
      return Response.status(200).entity(appointmentList).build();
    }

    @PUT
    @Path("/appointment/{appointmentId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateAppointmentStatus(@PathParam("appointmentId") Long appointmentId, Appointment appointmentWithStatus) {
      Optional<Appointment> appointmentOptional = appointmentService.getAppointment(appointmentId);
      if (!appointmentOptional.isPresent()) {
        return Response.status(404).build();
      }

      Appointment appointment = appointmentOptional.get();
      appointment.setStatus(appointmentWithStatus.getStatus());
      appointment = appointmentService.updateAppointment(appointment);

      return Response.status(200).entity(appointment).build();
    }
}
