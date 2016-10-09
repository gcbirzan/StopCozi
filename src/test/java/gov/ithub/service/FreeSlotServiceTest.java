package gov.ithub.service;

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

import static org.junit.Assert.*;

/**
 * Created by NiBo on 10/8/2016.
 */
@ActiveProfiles("test")
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = StopcoziApplication.class)
@Transactional
public class FreeSlotServiceTest {

	
	
    @Before
    public void setUp() throws Exception {
        
    }

    @Test
    public void testFindByLocation() throws Exception {
        Assert.assertNotNull(null);
    }
}