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

import java.util.List;

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

    @Test
    public void testFindByAgency() throws Exception {
        Service service = serviceDao.findByAgency(agencyDao.findOne(Long.valueOf(82)));
        Assert.assertNotNull(service);
        Assert.assertTrue(service.getName().contains("venitul estimat"));
    }

    @Test
    public void testFindByAgencyAndNameLike(){
        List<Service> services = serviceDao.findByAgencyAndNameLike(agencyDao.findOne(Long.valueOf(82)), "%decl%");
//        System.err.println(services);
//        services.forEach(s -> System.err.println(s.getName()));
        Assert.assertNotNull(services);
        Assert.assertNotNull(services.size() > 0);
    }
}