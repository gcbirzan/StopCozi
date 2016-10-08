package gov.ithub.dao;

import gov.ithub.model.Appointment;
import org.springframework.data.repository.CrudRepository;

import javax.transaction.Transactional;

/**
 * Created by claudiubar on 10/8/2016.
 */
@Transactional
public interface AppointmentDao extends CrudRepository<Appointment, Long> {

}
