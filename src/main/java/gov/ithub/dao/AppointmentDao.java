package gov.ithub.dao;

import gov.ithub.model.Appointment;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.Date;
import java.util.List;

/**
 * Created by claudiubar on 10/8/2016.
 */
@Transactional
public interface AppointmentDao extends CrudRepository<Appointment, Long> {
    @Query("select a from Appointment a where a.office.service.id = ?1 and a.start >= ?2 and a.end <= ?3")
    List<Appointment> getAppointmentsForService(Long serviceId, Date start, Date end);
}
