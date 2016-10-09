package gov.ithub;

import gov.ithub.rest.CitizenController;
import gov.ithub.rest.ClerkController;
import org.glassfish.jersey.server.ResourceConfig;
import org.springframework.stereotype.Component;

/**
 * Created by claudiubar on 10/8/2016.
 */
@Component
public class JerseyConfig extends ResourceConfig {

    public JerseyConfig() {
        register(new ObjectMapperContextResolver());
        register(CitizenController.class);
        register(ClerkController.class);
        register(CORSFilter.class);
    }

}
