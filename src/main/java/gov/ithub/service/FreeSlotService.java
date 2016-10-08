package gov.ithub.service;

import gov.ithub.model.FreeSlot;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * Created by claudiubar on 10/8/2016.
 */
@Component
public class FreeSlotService {
    public List<FreeSlot> getFreeSlots(Long serviceId, Date jumpToDate){
        FreeSlot freeSlot = new FreeSlot();
        freeSlot.setStart(new Date());
        //TODO: dao call here
        return Collections.singletonList(freeSlot);
    }
}
