import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, map, shareReplay, tap } from "rxjs/operators";
import { LoadingService } from "../loading/loading.service";
import { MessagesService } from "../messages/messages.service";
import { Course, sortCoursesBySeqNo } from "../model/course";

@Injectable({
  providedIn: 'root'
})
export class CoursesStore {
  private subject = new BehaviorSubject<Course[]>([]);
  courses$: Observable<Course[]> = this.subject.asObservable();

  constructor(
    private http: HttpClient,
    private messagesService: MessagesService,
    private loadingService: LoadingService
  ) {
    this.loadingCourse();
  }

  private loadingCourse() {
    const loadCourses$ = this.http.get<Course[]>('/api/courses')
      .pipe(
        map(res => res["payload"]),
        catchError(err => {
          let message = "Could not find courses";
          this.messagesService.showError(message);
          console.log(err, message);
          return throwError(err)
        }),
        tap((courses) => this.subject.next(courses))
      );

    this.loadingService.showloaderUntilCompleted(loadCourses$)
      .subscribe();
  };

  filterByCategory(category: string): Observable<Course[]> {
    return this.courses$
      .pipe((map(courses => 
        courses.filter(course => course.category == category)
          .sort(sortCoursesBySeqNo))))
  }

  saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {

    let oldCourses = this.subject.getValue();

    let index = oldCourses.findIndex(c => c.id === courseId);

    let newCourse: Course =  {
      ...oldCourses[index],
      ...changes
    }

    let newCourses: Course[] = oldCourses.slice(0);
    newCourses[index] = newCourse;
    this.subject.next(newCourses);

    return this.http.put(`/api/courses/${courseId}`, changes)
      .pipe(
        catchError(err => {
          let message = "Could not save courses";
          this.messagesService.showError(message)
          return throwError(err)
        }),
        shareReplay()
      );
  }
}