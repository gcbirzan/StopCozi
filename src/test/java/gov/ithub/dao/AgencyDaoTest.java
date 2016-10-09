package gov.ithub.dao;

import gov.ithub.StopcoziApplication;
import gov.ithub.model.Agency;
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

/**
 * Created by NiBo on 10/8/2016.
 */
@ActiveProfiles("test")
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = StopcoziApplication.class)
@Transactional
public class AgencyDaoTest {

    @Autowired
    private AgencyDao agencyDao;

    @Before
    public void setUp() throws Exception {
        Agency agency = new Agency();
        agency.setId(Long.valueOf(1));
        agency.setContact("Str. Basarabiei nr. 3");
        agency.setDescription("Short Description");
        agency.setLocation("IS");
        agency.setName("Test Agency");
        agencyDao.save(agency);
        agency.setId(Long.valueOf(2));
        agency.setContact("Str. Galati nr. 7");
        agency.setDescription("Long LOng Description");
        agency.setLocation("IS");
        agency.setName("Directia Finantelor Publice Iasi");
        agencyDao.save(agency);
        agency.setId(Long.valueOf(3));
        agency.setContact("Str. Dunarea nr. 7");
        agency.setDescription("Long LOng Description");
        agency.setLocation("DJ");
        agency.setName("Directia Finantelor Publice Dolj");
        agencyDao.save(agency);
    }

    @Test
    public void testFindByLocation() throws Exception {
        List<Agency> agencies = agencyDao.findByLocation("IS");
        Assert.assertNotNull(agencies);
        Assert.assertTrue(agencies.size() == 2);

    }

    @Test
    public void testFindByLocationAndNameLike() throws Exception {
        List<Agency> agencies = agencyDao.findByLocationAndNameLike("IS", "%Directia%");
        Assert.assertNotNull(agencies);
        Assert.assertTrue(agencies.size() == 1);
    }
}