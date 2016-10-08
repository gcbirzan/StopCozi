package gov.ithub.dao;

import gov.ithub.model.Agency;
import gov.ithub.model.Service;
import org.springframework.data.repository.CrudRepository;

/**
 * Created by NiBo on 10/8/2016.
 */
public interface ServiceDao extends CrudRepository<Service, Long> {
    Service findByAgency(Agency agency);
}
