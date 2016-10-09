package gov.ithub.dao;

import gov.ithub.model.Office;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by claudiubar on 10/8/2016.
 */
public interface OfficeDao extends CrudRepository<Office, Long> {
    List<Office> findByServiceId(Long serviceId);
}
