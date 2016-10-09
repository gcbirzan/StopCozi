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
import org.springframework.web.bind.annotation.CrossOrigin;

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

    @CrossOrigin(origins = "*")
    @GET
    @Path("/agencies/{location}{name :(/\\w+)?}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAgencies(@PathParam("location") String location, @PathParam("name")  String name) {
        List<Agency> agencies = agencyDao.findByLocationAndNameLike(location, "%" + name.replaceFirst("/", "") + "%");
        List<Agency> responseList = agencies.size() > 20 ? agencies.subList(0,20) : agencies;
        return Response.status(200)/*.header("Access-Control-Allow-Origin", "*")*/.entity(responseList).build();
    }

    @CrossOrigin(origins = "*")
    @GET
    @Path("/services/{agencyId}{serviceName :(/\\w+)?}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getServicesByAgencies(@PathParam("agencyId") Long agencyId, @PathParam("serviceName") String serviceName) {
        List<Service> services = serviceDao.findByAgencyAndNameLike(agencyDao.findOne(agencyId), "%" + serviceName.replaceFirst("/", "") + "%");
        List<Service> responseList = services.size() > 20 ? services.subList(0,20) : services;
        return Response.status(200)/*.header("Access-Control-Allow-Origin", "*")*/.entity(responseList).build();
    }

    @GET
    @Path("/freeslots/{serviceId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFreeSlots(@PathParam("serviceId") Long serviceId) {
        List<FreeSlot> freeSlotList = freeSlotService.getFreeSlots(serviceId, new Date());
        return Response.status(200).entity(freeSlotList).build();
    }

    @POST
    @Path("/appointment/{serviceId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createAppointment(@PathParam("serviceId") Long serviceId, Appointment appointment) {
        Optional<Appointment> savedAppointment = appointmentService.createAppointment(serviceId, appointment);
        return savedAppointment.isPresent() ?
            Response.status(200).entity("Mergeti cu incredere la ghiseul " + appointment.getOffice().getName()).build() :
            Response.status(400).entity("Alcineva dorind sa rezerve in acelasi timp a reusit inaintea dv.").build();
    }
}
