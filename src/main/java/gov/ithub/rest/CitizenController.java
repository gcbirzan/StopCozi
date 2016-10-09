package gov.ithub.rest;

import gov.ithub.dao.AgencyDao;
import gov.ithub.dao.ServiceDao;
import gov.ithub.model.Agency;
import gov.ithub.model.FreeSlot;
import gov.ithub.model.Service;
import gov.ithub.service.FreeSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
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
    private ServiceDao serviceDao;

    @Autowired
    private FreeSlotService freeSlotService;

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
        Service service = serviceDao.findByAgency(agencyDao.findOne(agencyId));
        serviceDao.findByAgencyAndNameLike(agencyDao.findOne(agencyId), "%"+serviceName+"%");
        return Response.status(200).entity(service).build();
    }

    @GET
    @Path("/freeslots/{serviceId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFreeSlots(@PathParam("serviceId") Long serviceId) {
        List<FreeSlot> freeSlotList = freeSlotService.getFreeSlots(serviceId, new Date());
        return Response.status(200).entity(freeSlotList).build();
    }
}
