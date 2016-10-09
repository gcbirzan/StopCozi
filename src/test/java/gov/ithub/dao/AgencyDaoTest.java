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

    @Test
    public void testFindByLocation() throws Exception {
        List<Agency> agencies = agencyDao.findByLocation("Hunedoara");
//        agencies.forEach(s -> System.err.println(s.getName()));
        Assert.assertNotNull(agencies);
        Assert.assertTrue(agencies.size() > 0);

    }

    @Test
    public void testFindByLocationAndNameLike() throws Exception {
        List<Agency> agencies = agencyDao.findByLocationAndNameLike("Hunedoara", "%IMPOZITE%");
        Assert.assertNotNull(agencies);
//        agencies.forEach(s-> System.err.println(s.getName()));
        Assert.assertTrue(agencies.size() > 0);
    }
}