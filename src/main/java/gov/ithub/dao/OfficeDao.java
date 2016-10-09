package gov.ithub.dao;

import gov.ithub.model.Office;
import org.springframework.data.repository.CrudRepository;

import javax.transaction.Transactional;

@Transactional
public interface OfficeDao extends CrudRepository<Office, Long> {
}
