package gov.ithub.dao;

import gov.ithub.model.Appointment;
import org.springframework.data.repository.CrudRepository;

import java.util.Date;
import java.util.List;

import javax.transaction.Transactional;

/**
 * Created by claudiubar on 10/8/2016.
 */
@Transactional
public interface AppointmentDao extends CrudRepository<Appointment, Long> {
	//FIXME: we need to implement a NamedQuery or find a proper name for method.
//	List<Appointment> findAppointmentsBetweenDates(Date start, Date end);
}
