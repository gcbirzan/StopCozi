package gov.ithub.dao;

import gov.ithub.model.Agency;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by claudiubar on 10/8/2016.
 */
public interface AgencyDao extends CrudRepository<Agency, Long> {
    List<Agency> findByLocation(String location);
    List<Agency> findByLocationAndNameLike(String location, String name);
}
