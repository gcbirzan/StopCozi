package gov.ithub.service;

import gov.ithub.dao.AppointmentDao;
import gov.ithub.dao.OfficeDao;
import gov.ithub.dao.ServiceDao;
import gov.ithub.model.Appointment;
import gov.ithub.model.Office;
import gov.ithub.model.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Created by claudiubar on 10/9/2016.
 */
@Component
public class AppointmentService {

    static final long ONE_MINUTE_IN_MILLIS = 60000;
    static final String SMS_SERVICE_API_SECRET_ENV = "STOP_COZI_API_SECRET";
    static final String SMS_SERVICE_API_KEY_ENV = "STOP_COZI_API_KEY";

    @Autowired
    private AppointmentDao appointmentDao;

    @Autowired
    private ServiceDao serviceDao;

    @Autowired
    private OfficeDao officeDao;

    private String formatDate(Date date) {
    	return new SimpleDateFormat("dd/MM/yyyy HH:mm").format(date);
    }

    private String getSMSContent(String name, String service, String data, long code) {
    	String test = "Programarea dvs la " + service + " pe " + data + " este confirmata. Codul programarii este " + code + ".";
    	return test;
    }

    private void sendSMS(String message, String to, String from) throws Exception {
        StringBuilder result = new StringBuilder();
        String apiSecret = System.getenv(SMS_SERVICE_API_SECRET_ENV);
        String apiKey = System.getenv(SMS_SERVICE_API_KEY_ENV);
        String urlString = "https://rest.nexmo.com/sms/json?api_key=" + apiKey + "&api_secret=" + apiSecret + "&from=" + from + "&to=" + to + "&text=" + URLEncoder.encode(message, "UTF-8");
        
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String line;

        while ((line = rd.readLine()) != null) {
           result.append(line);
        }

        rd.close();
    }

	public Optional<Appointment> createAppointment(Long serviceId, Appointment appointment){
        Service service = serviceDao.findById(serviceId);
        Date start = appointment.getStart();
        Date end = new Date(start.getTime() + (service.getDuration() * ONE_MINUTE_IN_MILLIS));
        appointment.setEnd(end);

        List<Appointment> appointments =  appointmentDao.getAppointmentsForService(serviceId, start, end);
        List<Long> busyOffices = appointments.stream().map(a -> a.getOffice().getId()).collect(Collectors.toList());

        List<Office> offices = officeDao.findByServiceId(serviceId);

        Optional<Office> firstFreeOffice = offices.stream().filter(o -> !busyOffices.contains(o.getId())).findFirst();
        if(firstFreeOffice.isPresent()) {
            appointment.setOffice(firstFreeOffice.get());
            Optional<Appointment> createdAppointment = Optional.of(appointmentDao.save(appointment));

            if (createdAppointment.isPresent()) {
            	try {
            		Appointment app = createdAppointment.get();
            		sendSMS(getSMSContent(app.getName(), service.getName(), formatDate(app.getStart()), app.getId()), app.getPhone(), "StopCozi");
            	} catch (Exception e) {
            		System.out.println("Error "+ e);
                // TODO: treat exception.
            	}
            	return createdAppointment;
            }
        }
        return Optional.empty();
    }

    public Optional<Appointment> getAppointment(Long appointmentId) {
      Appointment appointment = appointmentDao.findOne(appointmentId);
      if (appointment == null) {
        return Optional.empty();
      }
      return Optional.of(appointment);
    }

    public Appointment updateAppointment(Appointment appointment) {
      return appointmentDao.save(appointment);
    }
}
