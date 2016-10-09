package gov.ithub.service;

import gov.ithub.dao.AppointmentDao;
import gov.ithub.dao.OfficeDao;
import gov.ithub.dao.ServiceDao;
import gov.ithub.model.Appointment;
import gov.ithub.model.Office;
import gov.ithub.model.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Created by claudiubar on 10/9/2016.
 */
@Component
public class AppointmentService {

    static final long ONE_MINUTE_IN_MILLIS=60000;//millisecs

    @Autowired
    private AppointmentDao appointmentDao;

    @Autowired
    private ServiceDao serviceDao;

    @Autowired
    private OfficeDao officeDao;

    public Optional<Appointment> createAppointment(Long serviceId, Appointment appointment){
        Service service = serviceDao.findById(serviceId);
        Date start = appointment.getStart();
        Date end = new Date(start.getTime() + (service.getDuration() * ONE_MINUTE_IN_MILLIS));
        appointment.setEnd(end);

        List<Appointment> appointments =  appointmentDao.getAppointmentsForService(serviceId, start, end);
        List<Long> busyOffices = appointments.stream().map(a -> a.getOffice().getId()).collect(Collectors.toList());

        List<Office> offices = officeDao.findByServiceId(serviceId);

        Optional<Office> firstFreeOffice = offices.stream().filter(o -> !busyOffices.contains(o.getId())).findFirst();
        if(firstFreeOffice.isPresent()) {
            appointment.setOffice(firstFreeOffice.get());
            return Optional.of(appointmentDao.save(appointment));
        } else
            return Optional.empty();
    }
}
