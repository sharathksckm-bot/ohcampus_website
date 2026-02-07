import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MapsAPILoader } from '@agm/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})

export class CompareclgService {

  apiurl = environment.apiurl;
  apiurl2 = environment.apiurl2;
  constructor(private _httpClient: HttpClient, private mapsAPILoader: MapsAPILoader, private meta: Meta, private titleService: Title) { }

  //get state list
  public getstateList(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}CompareCollege/getStateList`,
      { defaultToken: localStorage.getItem('defaultToken') }, { headers, responseType: 'json' }
    );
  }


  updateMetaTags(data: { title: string, description: string, image: string, url: string }) {
    this.titleService.setTitle(data.title);

    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:image', content: data.image });
    this.meta.updateTag({ property: 'og:url', content: data.url });

    // Optionally, update other meta tags as needed
  }

  getImageAsBase64(url: string): Promise<string> {
    return this._httpClient.get(url, { responseType: 'blob' })
      .toPromise()
      .then(blob => this.blobToBase64(blob))
      .catch(error => {
        console.error('Error fetching image:', error);
        throw error;
      });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(blob);
    });
  }


  urlToBase64(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result as string);
        }
        reader.onerror = function (error) {
          reject(error);
        }
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = function (error) {
        reject(error);
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  //get city list
  public getcityList(stateId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}CompareCollege/getCityList`,
      { stateId: stateId, defaultToken: localStorage.getItem('defaultToken') }, { headers, responseType: 'json' }
    );
  }

  //get course category
  public getCourseCatList(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}CompareCollege/getccList`,
      { defaultToken: localStorage.getItem('defaultToken') }, { headers, responseType: 'json' }
    );
  }

  //get course
  public getCourse(catid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}CompareCollege/getCourseList`,
      { catid: catid, defaultToken: localStorage.getItem('defaultToken') }, { headers, responseType: 'json' }
    );
  }


  ////------------ALL COLLEGES API'S-----------------////
  //get city
  public getCity(search_term): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}City/getCityList`,
      { search_term: search_term, defaultToken: localStorage.getItem('defaultToken') }, { headers, responseType: 'json' }
    );
  }

  //get rank
  public getRankList(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Rank/getRankList`,
      { defaultToken: localStorage.getItem('defaultToken') }, { headers, responseType: 'json' }
    );
  }

  //get city
  public getCourseList(search_term): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCoursesList`,
      { search_term: search_term, defaultToken: localStorage.getItem('defaultToken') }, { headers, responseType: 'json' }
    );
  }

  //get Ownership List
  public getOwnershipList(search_term): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCollegeType`,
      {
        search_term: search_term, defaultToken: localStorage.getItem('defaultToken'),
      }, { headers, responseType: 'json' }
    );
  }

  //get Ownership List
  public getCollegeList(draw, length, start, order, search): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCollegeList`,
      {
        // eslint-disable-next-line max-len
        defaultToken: localStorage.getItem('defaultToken'),
        draw: draw,
        length: length,
        start: start,
        order: order,
        search: search
      }, { headers, responseType: 'json' }
    );
  }

  public getCollegeList1(selected_rank_category, search_keyword): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Rank/getCollegeList`,
      {
        selected_rank_category: selected_rank_category,
        search_keyword: search_keyword
      }, { headers, responseType: 'json' }
    );
  }


  ///------------Home Page API'S------------------//
  //Total count
  public getTotalCount(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/getTotalCount`,
      {
        defaultToken: localStorage.getItem('defaultToken'),

      }, { headers, responseType: 'json' }
    );
  }

  //getFeaturedColleges
  public getFeaturedColleges(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getFeaturedColleges`,
      {
        defaultToken: localStorage.getItem('defaultToken'),

      }, { headers, responseType: 'json' }
    );
  }

  //getFeaturedColleges
  public getTrendingColleges(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getTrendingColleges`,
      {
        defaultToken: localStorage.getItem('defaultToken'),

      }, { headers, responseType: 'json' }
    );
  }

  //getevents
  public getEvents(value): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Event/getEventList`,
      {
        value: value, defaultToken: localStorage.getItem('defaultToken'),

      }, { headers, responseType: 'json' }
    );
  }

  //getCategory
  public getCategory(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    return this._httpClient.post(
      `${this.apiurl}Category/getCategory`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  //getCategory
  public getCoursesByCatId(CatId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCoursesByCatId`,
      {
        CatId: CatId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  //Compare College page API
  //get college list for search
  public getCollegelistCompare(searchTerm, start, limit): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}CompareCollege/getCollegeList`,
      {
        searchTerm: searchTerm,
        start: start,
        limit: limit,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  //getDegreeData
  public getLevelById(Id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}CompareCollege/getLevelById`,
      {
        Id: Id, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  //getCoursesListbyColleges
  public getCoursesbyCollege(level, Id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}CompareCollege/getCoursesById`,
      {
        level: level,
        Id: Id, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  //getfeaturedcolleges
  public CompareCollege(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}CompareCollege/getFeaturedColleges`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  //getfeaturedcolleges
  public getCollegeDetailsByID(id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCollegeDetailsByID`,
      {
        id: id, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  //getfeaturedcolleges
  public getcompareCollegeDetailsByID(id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}CompareCollege/getCollegeDetailsByID`,
      {
        id: id, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCategoryForMenu(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Category/getCategoryForMenu`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCategoryForMenuNav(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Category/getCategoryForMenuNav`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCityList(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}City/getCity`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }
  public getCourseCategory(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCourseCategory`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  // public getCourseByCategory(categoryId): Observable<any> {
  //   return this._httpClient.post(
  //     `${this.apiurl} Courses/getCourseByCategory`,
  //     {
  //       categoryId: categoryId
  //     }
  //   );
  // }

  //05/04/024
  public getCourseByCategory(categoryId, search): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCourseByCategory`,
      {
        categoryId: categoryId,
        search: search, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  public getBlogs(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Blogs/getBlogs`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getBlogsbyCat(searchCategory, value): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Blogs/getBlogs`,
      {
        defaultToken: localStorage.getItem('defaultToken'),
        searchCategory: searchCategory,
        value: value
      }, { headers, responseType: 'json' }
    );
  }

  public getPlacementCategory(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Category/getPlacementCategory`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getPlacementCategoryById(clgId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');


    return this._httpClient.post(
      `${this.apiurl}Courses/getCourseCategoryById`,
      {
        collegeId: clgId,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );


  }

  public getPlacementDataOfClg(searchYear, searchCategory, collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    // alert(searchYear+"  "+searchCategory)
    return this._httpClient.post(
      `${this.apiurl}College/getPlacementDataOfClg`,
      {
        searchYear: searchYear,
        searchCategory: searchCategory,
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getExamNotificationForClg(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Exam/getExamNotificationForClg`,
      {
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getRanktDataOfClg(collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getRanktDataOfClg`,
      {
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCoursesAndFeesOfClg(collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCoursesAndFeesOfClg`,
      {
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getFAQsOfClg(collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getFAQsOfClg`,
      {
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCollegeProgrammesByID(collegeId, categoryid, subcategory): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCollegeProgrammesByID`,
      {
        collegeId: collegeId,
        categoryid: categoryid,
        subcategory: subcategory, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public coursesOfferedInSameGroup(collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/coursesOfferedInSameGroup`,
      {
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCollegeContactDetails(collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCollegeContactDetails`,
      {
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getcollegeByLocation(cityid, collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getcollegeByLocation`,
      {
        cityid: cityid,
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCollegeAdmissionProcess(collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCollegeAdmissionProcess`,
      {
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCoursesOfCollege(collegeId, catId, clgTypeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCoursesOfCollege`,
      {
        collegeId: collegeId,
        categoryId: catId,
        collegeTypeId: clgTypeId,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCoursesOfCollegeFilter(collegeId, course, courselevel, total_fees, exam_accepted, course_name, collegeTypeId
  ): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCoursesOfCollege`,
      {
        collegeId: collegeId,
        course: course,
        courselevel: courselevel,
        total_fees: total_fees,
        exam_accepted: exam_accepted,
        course_name: course_name,
        collegeTypeId: collegeTypeId,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getOtherCollegesOfferingSameCourseInSameCity(cityId, collegeId, subcatid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getOtherCollegesOfferingSameCourseInSameCity`,
      {
        cityId: cityId,
        collegeId: collegeId,
        subcatid: subcatid,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCoursesBySubcategory(collegeId, subcategory, categoryId, collegeTypeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCoursesBySubcategory`,
      {
        collegeId: collegeId,
        subcategory: subcategory,
        categoryId: categoryId,
        collegeTypeId: collegeTypeId,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getLatestBlogs(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Blogs/getLatestBlogs`,
      {
        collegeid: collegeid,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getSubCategoryList(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/getSubCategoryList`,
      {
        collegeid: collegeid,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCourseLevel(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/getCourseLevel`,
      {
        collegeid: collegeid,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getExamAccepted(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/getExamAccepted`,
      {
        collegeid: collegeid,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getScholarShipOfClg(collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getScholarShipOfClg`,
      {
        collegeId: collegeId,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCollegeHighlightByID(id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCollegeHighlightByID`,
      {
        id: id, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }
  public getCollegeFacilitiesByID(id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCollegeFacilitiesByID`,
      {
        id: id, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }
  public getFeesDataOfCollege(collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getFeesDataOfCollege`,
      {
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getExamList(value): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Exam/getExamList`,
      {
        value: value, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCollegeListForCompare(searchClg): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCollegeListForCompare`,
      {
        searchClg: searchClg, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getExamDetails(examId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Exam/getExamDetails`,
      {
        examId: examId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getBlogsDetails(blogId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Blogs/getBlogsDetails`,
      {
        blogId: blogId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getBlogCategory(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Blogs/getBlogCategory`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public saveCourseInquiry(firstName, lastName, email, phone, state, city, courseCategory, course, intrestedIn): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/saveCourseInquiry`,
      {
        city: city,
        course: course,
        courseCategory: courseCategory,
        defaultToken: localStorage.getItem('defaultToken'),
        email: email,
        firstName: firstName,
        intrestedIn: intrestedIn,
        lastName: lastName,
        phone: phone,
        state: state,
      }, { headers, responseType: 'json' }
    );
  }

  public getUnAnsweredQueofCollege(length, draw, collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/getUnAnsweredQueofCollege`,
      {
        length: length,
        draw: draw,
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getQAofCollege(length, draw, collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/getQAofCollege`,
      {
        length: length,
        draw: draw,
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getQADataByQueId(collegeId, QueId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/getQADataByQueId`,
      {
        collegeId: collegeId,
        QueId: QueId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public postQuestion(collegeid, courselevel, course, user_id, questionInput): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/postQuestion`,
      {
        collegeid: collegeid,
        courselevel: courselevel,
        course: course,
        user_id: user_id,
        questionInput: questionInput, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public postAnswere(answer, user_id, questionId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/postAnswere`,
      {
        answer: answer,
        user_id: user_id,
        questionId: questionId, defaultToken: localStorage.getItem('defaultToken')

      }, { headers, responseType: 'json' }
    );
  }

  public postAnsComment(comment, user_id, answer_id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/postAnsComment`,
      {
        comment: comment,
        user_id: user_id,
        answer_id: answer_id, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public followQuestion(action, user_id, question_id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/followQuestion`,
      {
        action: action,
        user_id: user_id,
        question_id: question_id, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public voteAnswere(action, answer_id, user_id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/voteAnswere`,
      {
        action: action,
        answer_id: answer_id,
        user_id: user_id, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public saveEnquiry(name, email, phone, state, city, message, postid, type): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/saveEnquiry`,
      {
        city: city,
        defaultToken: localStorage.getItem('defaultToken'),
        email: email,
        message: message,
        name: name,
        phone: phone,
        postid: postid,
        state: state,
        type: type,
      }, { headers, responseType: 'json' }
    );
  }

  public getPopularClgByLocation(cityid, courseId, categoryid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getPopularClgByLocation`,
      {
        cityid: cityid,
        courseid: courseId,
        categoryid: categoryid,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getPopularClgByLoc_cat(cityId, courseId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getPopularClgByLoc_cat`,
      {
        cityid: cityId,
        courseid: courseId,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    )
  }

  public getEventDetails(eventid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Event/getEventDetails`,
      {
        eventid: eventid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  public getCollegesAccordingCategory(collegeid, categories): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getCollegesAccordingCategory`,
      {
        collegeid: collegeid,
        categories: categories, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getTotalQuestionForCollege(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/getTotalQuestionForCollege`,
      {
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getQueAnsAboutAdmissions(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/getQueAnsAboutAdmissions`,
      {
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  public getReviewDetails(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Review/getReviewDetails`,
      {
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCollegeTotalRate(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Review/getCollegeTotalRate`,
      {
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public voteReview(user_id, reviewid, ishelpful): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Review/voteReview`,
      {
        user_id: user_id,
        reviewid: reviewid,
        ishelpful: ishelpful, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public addReview(
    user_id,
    collegeid,
    courtype,
    courseid,
    title,
    placement_rate,
    placement_description,
    infrastructure_rate,
    infrastructure_description,
    faculty_rate,
    faculty_description,
    hostel_rate,
    hostel_description,
    campus_rate,
    campus_description,
    money_rate,
    money_description
  ): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Review/addReview`,
      {
        user_id: user_id,
        collegeid: collegeid,
        courtype: courtype,
        courseid: courseid,
        title: title,
        placement_rate: placement_rate,
        placement_description: placement_description,
        infrastructure_rate: infrastructure_rate,
        infrastructure_description: infrastructure_description,
        faculty_rate: faculty_rate,
        faculty_description: faculty_description,
        hostel_rate: hostel_rate,
        hostel_description: hostel_description,
        campus_rate: campus_rate,
        campus_description: campus_description,
        money_rate: money_rate,
        money_description: money_description,
        defaultToken: localStorage.getItem('defaultToken'),
      }, { headers, responseType: 'json' }
    );
  }

  public downloadBrochure(collegeId, userId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/downloadBrochure`,
      {
        collegeId: collegeId,
        userId: userId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public downloadQutionPaper(paperId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain;charset=utf-8');
    return this._httpClient.post(`${this.apiurl}Common/`, {
      paperId: paperId
    }, { headers, responseType: 'json' })
  }

  public savCourseApplication(student_name, email, mobile_no, category, college, course, entrance_exam, rank, score): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/savCourseApplication`,
      {
        student_name: student_name,
        email: email,
        mobile_no: mobile_no,
        category: category,
        college: college,
        course: course,
        entrance_exam: entrance_exam,
        rank: rank,
        score: score, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public savPredictAdmission(student_name, email, mobile_no, category, college, course, entrance_exam, rank, score): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/savPredictAdmission`,
      {
        student_name: student_name,
        email: email,
        mobile_no: mobile_no,
        category: category,
        college: college,
        course: course,
        entrance_exam: entrance_exam,
        rank: rank,
        score: score, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  public getCourseByCategoryClg(categoryId, collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCourseByCategoryClg`,
      {
        categoryId: categoryId,
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getStateList(search): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}State/getStateList`,
      {
        search: search, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCoursesOfCollegefilteredtotal_fees(collegeId, feesArr): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(`${this.apiurl}Courses/getCoursesOfCollegefilteredtotal_fees`,
      {
        collegeId: collegeId,
        feesArr: feesArr,
        defaultTocken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    )
  }

  public getCityByState(search, stateid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}City/getCityByState`,
      {
        search: search, stateid: stateid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  //homepage getTrendingSpecilization
  public getTrendingSpecilization(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/getTrendingSpecilization`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getlistofCertificate(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Certification/getlistofCertificate`,
      {
        defaultToken: localStorage.getItem('defaultToken')

      }, { headers, responseType: 'json' }
    );
  }

  public getAllCourseList(draw, length, start, order, search): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCourseList`,
      {
        draw: draw,
        length: length,
        start: start,
        order: order,
        search: search, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCourseListById(draw, length, start, order, id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCourseList`,
      {
        draw: draw,
        length: length,
        start: start,
        order: order,
        search: id, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  public getCertificationDatabyId(certificateId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Certification/getCertificationDatabyId`,
      {
        certificateId: certificateId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public sendContactMail(name, email, contactNo, subject, message): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/sendContactMail`,
      {
        name: name,
        email: email,
        contactNo: contactNo,
        subject: subject,
        message: message,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getScholarships(search): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Scholarship/getScholarships`,
      {
        search: search, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getLoans(search): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Loan/getLoans`,
      {
        search: search, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getFaqCategory(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Faq/getFaqCategory`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getFaqs(search, category): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Faq/getFaqs`,
      {
        search: search,
        category: category,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCoursesFeeStructure(courseid, collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCoursesFeeStructure`,
      {
        courseid: courseid,
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCoursesInfo(courseid, collegeId, college_typeid, categoryid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCoursesInfo`,
      {
        courseid: courseid,
        collegeId: collegeId, college_typeid: college_typeid, categoryid: categoryid,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCoursesAdmissionProcess(courseid, collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getCoursesAdmissionProcess`,
      {
        courseid: courseid,
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getQueAnsAboutCourses(collegeid, courseid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/getQueAnsAboutCourses`,
      {
        collegeid: collegeid,
        courseid: courseid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getEntranceExamsForCourse(courseid, collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Courses/getEntranceExamsForCourse`,
      {
        courseid: courseid,
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public collegesOffereingSameCourseAtSameCity(courseid, cityid, collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/collegesOffereingSameCourseAtSameCity`,
      {
        courseid: courseid,
        cityid: cityid,
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public AdmissionProcessImportantDatesPDF(collegeId, sub_category): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/AdmissionProcessImportantDatesPDF`,
      {
        collegeId: collegeId,
        sub_category: sub_category, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getLastThreeYearsPlacementData(collegeId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getLastThreeYearsPlacementData`,
      {
        collegeId: collegeId, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getPlacementRating(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Review/getPlacementRating`,
      {
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getInfrastructureRating(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Review/getInfrastructureRating`,
      {
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getQueAnsAboutScholarships(collegeid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}QuestionAnswere/getQueAnsAboutScholarships`,
      {
        collegeid: collegeid, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getRatingList(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Review/getRatingList`,
      {
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getKCETCutoffCat(searchval): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Cutoff/getKCETCutoffCat`,
      {
        searchval: searchval, defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getKCETCutOff(college_id, round, category): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Cutoff/getKCETCutOff`,
      {
        college_id: college_id,
        round: round,
        category: category,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCOMDEKCutOff(college_id, round, category): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Cutoff/getCOMDEKCutOff`,
      {
        college_id: college_id,
        round: round,
        category: category,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  private apiKey = 'AIzaSyAMybtct7fx4uCZyrxiZ_ykI0cSihTjINg';
  getPlaceReviews(placeId: string): Observable<any> {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,reviews&key=${this.apiKey}`;
    // const url = proxyUrl+ apiUrl;
    const url = apiUrl;

    return this._httpClient.get<any>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Unknown error occurred';
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(errorMessage);
      })
    );
  }

  loadGoogleMapsApi(): Promise<void> {
    return this.mapsAPILoader.load();
  }

  getReviews(placeId: string): Observable<any> {
    const url = 'https://maps.googleapis.com/maps/api/place/details/json';
    const params = new HttpParams()
      .set('placeid', placeId)
      .set('key', 'AIzaSyAMybtct7fx4uCZyrxiZ_ykI0cSihTjINg');

    return this._httpClient.get(url, { params });

  }

  // get popular college list to camprae
  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  public getPopularCollegeListForCompare(categoryid: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}College/getPopularCollegeListForCompare`,
      { categoryid: categoryid, defaultToken: localStorage.getItem('defaultToken') }, { headers, responseType: 'json' }
    );
  }

  public getCounsellingFees(college_id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Cutoff/getCounsellingFees`,
      { college_id: college_id, defaultToken: localStorage.getItem('defaultToken') }, { headers, responseType: 'json' }
    );
  }

  public generateLink_req(college_id, type): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Common/generateLink_req`,
      { id: college_id, type: type }, { headers, responseType: 'json' }
    );
  }

  public getKCETCutOffByRound(college_id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Cutoff/getCutOffRoundWise`,
      {
        college_id: college_id,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getCOMEDKCutOffRoundWise(college_id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Cutoff/getCOMEDKCutOffRoundWise`,
      {
        college_id: college_id,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  public getCoursesForCategory(categoryid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Category/getCoursesForCategory`,
      {
        categoryid: categoryid,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getExamForCategory(categoryid): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}Category/getExamForCategory`,
      {
        categoryid: categoryid,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  public getCompareCollegeDetailsByID(id, courselevel, subcategory): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}CompareCollege/getCollegeDetailsByID`,
      {
        id: id,
        courselevel: courselevel,
        subcategory: subcategory,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public resendOTP(email): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}user/resendOTP`,
      {
        email: email,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }


  public ResetPass(email, link): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}User/ResetPass`,
      {
        email: email,
        link: link,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public UpdateNewPass(email, newPass, confirmPass): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl}User/UpdateNewPass`,
      {
        email: email,
        newPass: newPass,
        confirmPass: confirmPass,
        defaultToken: localStorage.getItem('defaultToken')
      }, { headers, responseType: 'json' }
    );
  }

  public getMenuData(): Observable<any> {
    return this._httpClient.get<any>('assets/menu.json');
  }

  // public getSampleCSV(): Observable<any> {
  //   return this._httpClient.post(
  //     `https://win.k2key.in/ohcampus/admin/Cutoff/getSampleCSV`,
  //     {}
  //   );
  // }

  // public getSampleCSV(): Observable<any> {
  //   return this._httpClient.post(
  //     `https://win.k2key.in/ohcampus/create_html/createHtml?id=9521&type=college`,
  //     {}
  //   );
  // }

  public get(data: any, type): Observable<any> {
    this.apiurl = 'https://win.k2key.in/ohcampus/create_html/createHtml?id=' + `${type}`;
    return this._httpClient
      .get<any>(this.apiurl, data);

  }

  // ---------------------------------------getHostelData--------------------------------------------------------
  public getHostelData(hostelId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this._httpClient.post(
      `${this.apiurl2}Hostel/getHostelData`,
      {
        id: hostelId
        , defaultToken: localStorage.getItem('defaultToken')
      }
      , { headers, responseType: 'json' }
    );
  }

  // --------------------------------------- saveHostelEnquiry--------------------------------------------------------
  public saveHostelEnquiry(name, email, phone_no, state, city, message, hostelId, type): Observable<any> {

    return this._httpClient.post(
      `${this.apiurl}college/savehostelinquiry`,
      {
        name: name,
        email: email,
        phone_no: phone_no,
        state: state,
        city: city,
        message: message,
        hostelId: hostelId,
        type: type
      }
    )
  }

  // ---------------------------------------getHostelDetailsByClgId--------------------------------------------------------
  public getHostelDetailsByClgId(clgId): Observable<any> {
    console.log(clgId)
    return this._httpClient.post(
      `${this.apiurl}College/getHostelDetailsByCollegeId`,
      {
        collegeId: clgId
      }
    );
  }

  public saveSearchLog(user_id, type, search_key, platform): Observable<any> {
    // console.log(clgId)   
    return this._httpClient.post(
      `${this.apiurl}User/saveSearchLog`,
      {
        user_id: user_id,
        type: type,
        search_key: search_key,
        platform: platform
      }
    );
  }

  public saveStudyAbroad(name, email, contact_no, state_name, city_name, category, course, country): Observable<any> {
    // console.log(clgId)   
    return this._httpClient.post(
      `${this.apiurl}Common/saveStudyAbroad`,
      {
        name: name,
        email: email,
        contact_no: contact_no,
        state_name: state_name,
        city_name: city_name,
        category: category,
        course: course,
        country: country
      }
    );
  }

  public getCountries(): Observable<any> {
    console.log()
    return this._httpClient.post(
      `${this.apiurl}Common/getCountries`,
      {
      }
    );
  }

  public getfooterNotification(): Observable<any> {
    // console.log(clgId)
    return this._httpClient.post(
      `${this.apiurl}Common/getfooterNotification`,
      {
        // collegeId: clgId
      }
    );
  }

  public signInWithGoogle(email): Observable<any> {
    // console.log(clgId)
    return this._httpClient.post(
      `${this.apiurl}Common/signInWithGoogle`,
      {
        email:email
      }
    );
  }



  //  public abc(email): Observable<any> {
  //   // console.log(clgId)   
  //   return this._httpClient.post(
  //     `https://coderlab.cdrlb.com/PropertyReselling/api/login`,
  //     {
  //       email:email
  //     }
  //   );
  // }
}
