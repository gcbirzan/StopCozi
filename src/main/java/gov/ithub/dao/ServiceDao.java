package gov.ithub.dao;

import org.springframework.data.repository.CrudRepository;

import gov.ithub.model.Service;

public interface ServiceDao extends CrudRepository<Service, Long> {
	Service findById(Long serviceId);
}
