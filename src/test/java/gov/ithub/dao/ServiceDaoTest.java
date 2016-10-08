package gov.ithub.dao;

import gov.ithub.StopcoziApplication;
import gov.ithub.model.Agency;
import gov.ithub.model.Service;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.Assert.*;

/**
 * Created by NiBo on 10/8/2016.
 */
@ActiveProfiles("test")
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = StopcoziApplication.class)
@Transactional
public class ServiceDaoTest {

    @Autowired
    private AgencyDao agencyDao;

    @Autowired
    private ServiceDao serviceDao;

    @Before
    public void setUp() throws Exception {
        populateWithAgencies();
        populateWithServices();
    }

    @Test
    public void testFindByAgency() throws Exception {
        Service service = serviceDao.findByAgency(agencyDao.findOne(Long.valueOf(1)));
        Assert.assertNotNull(service);
        Assert.assertEquals(service.getName(), "Depunere formular 200");
    }

    private void populateWithAgencies() {
        Agency agency = new Agency();
        agency.setId(Long.valueOf(1));
        agency.setContact("Str. Basarabiei nr. 3");
        agency.setCounty("Iasi");
        agency.setDescription("Short Description");
        agency.setLocation("IS");
        agency.setName("Test Agency");
        agencyDao.save(agency);
        agency.setId(Long.valueOf(2));
        agency.setContact("Str. Galati nr. 7");
        agency.setCounty("Iasi");
        agency.setDescription("Long LOng Description");
        agency.setLocation("IS");
        agency.setName("Directia Finantelor Publice Iasi");
        agencyDao.save(agency);
        agency.setId(Long.valueOf(3));
        agency.setContact("Str. Dunarea nr. 7");
        agency.setCounty("Dolj");
        agency.setDescription("Long LOng Description");
        agency.setLocation("DJ");
        agency.setName("Directia Finantelor Publice Dolj");
        agencyDao.save(agency);
    }

    private void populateWithServices() {
        Service service = new Service();
        service.setId(Long.valueOf(1));
        service.setName("Depunere formular 200");
        service.setAgency(agencyDao.findOne(Long.valueOf(1)));
        serviceDao.save(service);
    }
}