package gov.ithub.rest;

import gov.ithub.dao.AgencyDao;
import gov.ithub.dao.ServiceDao;
import gov.ithub.model.Agency;
import gov.ithub.model.Appointment;
import gov.ithub.model.FreeSlot;
import gov.ithub.model.Service;
import gov.ithub.service.AppointmentService;
import gov.ithub.service.FreeSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Created by claudiubar on 10/8/2016.
 */
@Component
@Path("/")
public class CitizenController {

    @Autowired
    private AgencyDao agencyDao;
    
    @Autowired
    private ServiceDao serviceDao;

    @Autowired
    private FreeSlotService freeSlotService;

    @Autowired
    private AppointmentService appointmentService;

    @GET
    @Path("/agencies/{location}/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAgencies(@PathParam("location") String location, @PathParam("name") String name) {
        List<Agency> agencies = agencyDao.findByLocationAndNameLike(location, "%" + name + "%");
        return Response.status(200).entity(agencies).build();
    }

    @GET
    @Path("/services/{agencyId}/{serviceName}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getServicesByAgencies(@PathParam("agencyId") Long agencyId, @PathParam("serviceName") String serviceName) {
        List<Service> services = serviceDao.findByAgencyAndNameLike(agencyDao.findOne(agencyId), "%" + serviceName + "%");
        return Response.status(200).entity(services).build();
    }

    @GET
    @Path("/freeslots/{serviceId}/{year}/{month}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFreeSlots(@PathParam("serviceId") Long serviceId, @PathParam("year") Integer year, @PathParam("month") Integer month) {
    	Calendar calendar = Calendar.getInstance();
    	calendar.set(Calendar.MONTH, month);
    	calendar.set(Calendar.YEAR, year);
    	
        List<FreeSlot> freeSlotList = freeSlotService.getFreeSlots(serviceId, calendar.getTime());
        return Response.status(200).entity(freeSlotList).build();
    }

    @POST
    @Path("/appointment/{serviceId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createAppointment(@PathParam("serviceId") Long serviceId, Appointment appointment) {
        Optional<Appointment> savedAppointment = appointmentService.createAppointment(serviceId, appointment);
        return savedAppointment.isPresent() ?
            Response.status(200).entity(savedAppointment.get()).build() :
            Response.status(400).entity("Alcineva dorind sa rezerve in acelasi timp a reusit inaintea dv.").build();
    }
}
