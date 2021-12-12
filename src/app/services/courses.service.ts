import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Course, sortCoursesBySeqNo } from '../model/course';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  constructor(
    private http: HttpClient
  ) { }

  loadDataCourses(): Observable<Course[]> {
    return this.http.get<Course[]>('/api/courses')
              .pipe(
                map(res => res["payload"]),
                shareReplay()
              )
  }

  saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {
    return this.http.put(`/api/courses/${courseId}`, changes)
      .pipe(
        shareReplay()
      );
  }
}
