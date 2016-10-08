package gov.ithub.rest;

import gov.ithub.dao.AgencyDao;
import gov.ithub.model.Agency;
import gov.ithub.model.FreeSlot;
import gov.ithub.service.FreeSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Date;
import java.util.List;

/**
 * Created by claudiubar on 10/8/2016.
 */
@Component
@Path("/")
public class CitizenController {

    @Autowired
    private AgencyDao agencyDao;

    @Autowired
    private FreeSlotService freeSlotService;

    @GET
    @Path("/agencies")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAgencies() {
        Agency agency = new Agency();
        agency.setName("Test Agency");
        return Response.status(200).entity(agency).build();
    }

    @GET
    @Path("/freeslots/{serviceId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFreeSlots(@PathParam("serviceId") Long serviceId) {
        List<FreeSlot> freeSlotList = freeSlotService.getFreeSlots(serviceId, new Date());
        return Response.status(200).entity(freeSlotList).build();
    }
}
